"""
Audio Mastering Microservice
FastAPI-based service for professional audio mastering and format conversion
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import logging
import os
from datetime import datetime

from services.audio_processor import AudioProcessor
from services.ml_mastering import MLMasteringEngine
from services.storage_manager import StorageManager
from services.ffmpeg_converter import FFmpegConverter
from models.request_models import MasteringRequest, MasteringResponse
from utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Audio Mastering Microservice",
    description="Professional audio mastering and format conversion service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
audio_processor = AudioProcessor()
ml_engine = MLMasteringEngine()
storage_manager = StorageManager()
ffmpeg_converter = FFmpegConverter()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Audio Mastering Microservice",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check if all services are available
        services_status = {
            "audio_processor": audio_processor.is_available(),
            "ml_engine": ml_engine.is_available(),
            "storage_manager": storage_manager.is_available(),
            "ffmpeg_converter": ffmpeg_converter.is_available()
        }
        
        all_healthy = all(services_status.values())
        
        return {
            "status": "healthy" if all_healthy else "degraded",
            "services": services_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@app.post("/master", response_model=MasteringResponse)
async def master_audio(request: MasteringRequest, background_tasks: BackgroundTasks):
    """
    Main mastering endpoint
    Processes audio file with ML mastering and format conversion
    """
    try:
        logger.info(f"Starting mastering request for user {request.user_id}")
        
        # Validate request
        if not request.file_url:
            raise HTTPException(status_code=400, detail="file_url is required")
        
        # Download input file
        logger.info(f"Downloading input file: {request.file_url}")
        input_file_path = await audio_processor.download_file(request.file_url)
        
        # Process audio with ML mastering
        logger.info(f"Applying ML mastering for genre: {request.genre}, tier: {request.tier}")
        mastered_file_path = await ml_engine.process_audio(
            input_file_path=input_file_path,
            genre=request.genre,
            tier=request.tier,
            target_lufs=request.target_lufs
        )
        
        # Convert to target format
        logger.info(f"Converting to format: {request.target_format}, sample rate: {request.target_sample_rate}")
        final_file_path = await ffmpeg_converter.convert_audio(
            input_path=mastered_file_path,
            output_format=request.target_format,
            sample_rate=request.target_sample_rate
        )
        
        # Upload to storage
        logger.info("Uploading mastered file to storage")
        file_url = await storage_manager.upload_file(
            file_path=final_file_path,
            user_id=request.user_id,
            format=request.target_format
        )
        
        # Get audio metadata
        metadata = await audio_processor.get_audio_metadata(final_file_path)
        
        # Cleanup temporary files
        background_tasks.add_task(cleanup_temp_files, [input_file_path, mastered_file_path, final_file_path])
        
        logger.info(f"Mastering completed successfully for user {request.user_id}")
        
        return MasteringResponse(
            status="done",
            url=file_url,
            lufs=metadata.get("lufs", request.target_lufs),
            format=request.target_format,
            duration=metadata.get("duration", 0),
            sample_rate=request.target_sample_rate,
            file_size=metadata.get("file_size", 0),
            processing_time=metadata.get("processing_time", 0)
        )
        
    except Exception as e:
        logger.error(f"Mastering failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mastering failed: {str(e)}")

@app.get("/formats")
async def get_supported_formats():
    """Get list of supported audio formats"""
    return {
        "input_formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
        "output_formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
        "sample_rates": [44100, 48000, 96000, 192000],
        "genres": ["Hip-Hop", "Afrobeats", "Gospel", "Pop", "Rock", "Electronic", "Jazz", "Classical"]
    }

@app.get("/tiers")
async def get_tier_info():
    """Get tier-specific processing capabilities"""
    return {
        "Free": {
            "max_file_size_mb": 50,
            "formats": ["WAV", "MP3"],
            "sample_rates": [44100, 48000],
            "processing_priority": "low"
        },
        "Pro": {
            "max_file_size_mb": 200,
            "formats": ["WAV", "MP3", "FLAC", "AIFF"],
            "sample_rates": [44100, 48000, 96000],
            "processing_priority": "medium"
        },
        "Advanced": {
            "max_file_size_mb": 500,
            "formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
            "sample_rates": [44100, 48000, 96000, 192000],
            "processing_priority": "high"
        }
    }

async def cleanup_temp_files(file_paths: list):
    """Clean up temporary files"""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup file {file_path}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
