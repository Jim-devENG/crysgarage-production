"""
Audio Mastering Microservice - With Real Audio Processing
FastAPI-based service for professional audio mastering and format conversion
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
import tempfile
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
import asyncio
import json
import os
import sentry_sdk
from datetime import datetime
import math
import uuid
import io
import subprocess
import shutil

from services.audio_processor import AudioProcessor
from services.ml_mastering import MLMasteringEngine
from services.storage_manager import StorageManager
from services.ffmpeg_converter import FFmpegConverter
from services.resource_monitor import resource_monitor
from models.request_models import MasteringRequest, MasteringResponse
from services.analysis import analyze_audio_file
from config.logging import configure_logging, get_logger, AudioProcessingLogger
from config.settings import DEBUG, LOG_LEVEL, SENTRY_DSN, AUDIO_PRESETS, GENRE_SETTINGS

# Configure enhanced logging
configure_logging(LOG_LEVEL)
logger = get_logger(__name__)
audio_logger = AudioProcessingLogger(logger)

# Initialize Sentry for error tracking
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )

# Initialize FastAPI app
app = FastAPI(
    title="Audio Mastering Microservice",
    description="Professional audio mastering and format conversion service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - ALLOW ALL ORIGINS WITH DEBUG LOGGING
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static serving for processed/temp files
TEMP_DIR = tempfile.gettempdir()
try:
    app.mount("/files", StaticFiles(directory=TEMP_DIR), name="files")
except Exception:
    app.mount("/files", StaticFiles(directory="."), name="files")

# Initialize services
audio_processor = AudioProcessor()
ml_engine = MLMasteringEngine()
storage_manager = StorageManager()
ffmpeg_converter = FFmpegConverter()

# Simple in-memory progress broker keyed by user_id
progress_queues: Dict[str, asyncio.Queue] = {}

def get_progress_queue(user_id: str) -> asyncio.Queue:
    if user_id not in progress_queues:
        progress_queues[user_id] = asyncio.Queue()
    return progress_queues[user_id]

async def progress_emit(user_id: str, stage: str, percent: float, extra: Optional[dict] = None):
    payload = {"stage": stage, "percent": max(0.0, min(100.0, float(percent)))}
    if extra:
        payload.update(extra)
    queue = get_progress_queue(user_id)
    await queue.put(payload)

@app.get("/progress-stream")
async def progress_stream(user_id: str):
    async def event_gen():
        queue = get_progress_queue(user_id)
        # initial
        yield f"data: {json.dumps({'stage': 'connected', 'percent': 0})}\n\n"
        try:
            while True:
                event = await queue.get()
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.CancelledError:
            return
    return StreamingResponse(event_gen(), media_type="text/event-stream")

# Optional noise reduction
try:
    import noisereduce as nr  # type: ignore
    _NR_AVAILABLE = True
except Exception:
    _NR_AVAILABLE = False

@app.on_event("startup")
async def startup_event():
    """Start background tasks when FastAPI starts"""
    storage_manager.start_cleanup_task()

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

@app.get("/tiers")
async def get_tiers() -> Dict[str, Any]:
    """Return tier information matching frontend TierInfo interface with debug logging."""
    logger.info("🔍 /tiers endpoint called - returning tier information")
    
    response_data = {
        "free": {
            "processing_quality": "standard",
            "max_processing_time": 300,
            "available_formats": ["mp3", "wav"],
            "max_sample_rate": 44100,
            "max_bit_depth": 16,
            "features": {
                "stereo_widening": False,
                "harmonic_exciter": False,
                "multiband_compression": False,
                "advanced_features": False
            },
            "processing_limits": {
                "eq_bands": 3,
                "compression_ratio_max": 4
            },
            "max_file_size_mb": 20
        },
        "professional": {
            "processing_quality": "high",
            "max_processing_time": 600,
            "available_formats": ["mp3", "wav"],
            "max_sample_rate": 48000,
            "max_bit_depth": 24,
            "features": {
                "stereo_widening": True,
                "harmonic_exciter": True,
                "multiband_compression": True,
                "advanced_features": False
            },
            "processing_limits": {
                "eq_bands": 5,
                "compression_ratio_max": 8
            },
            "max_file_size_mb": 200
        },
        "advanced": {
            "processing_quality": "premium",
            "max_processing_time": 1200,
            "available_formats": ["mp3", "wav"],
            "max_sample_rate": 96000,
            "max_bit_depth": 32,
            "features": {
                "stereo_widening": True,
                "harmonic_exciter": True,
                "multiband_compression": True,
                "advanced_features": True
            },
            "processing_limits": {
                "eq_bands": 10,
                "compression_ratio_max": 20
            },
            "max_file_size_mb": 500
        }
    }
    
    logger.info(f"🔍 Returning {len(response_data)} tiers: {list(response_data.keys())}")
    return response_data

@app.get("/genres")
async def get_genre_information():
    """Get genre-specific processing information"""
    try:
        genre_info = ml_engine.get_genre_information()
        return {
            "status": "success",
            "genres": genre_info,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get genre information: {e}")
        raise HTTPException(status_code=500, detail="Failed to get genre information")

def get_tier_bitrate_settings(tier: str) -> Dict[str, Any]:
    """Get bitrate and quality settings based on tier"""
    settings = {
        "free": {
            "mp3_bitrate": 128,  # 128 kbps for free tier
            "wav_bit_depth": 16,
            "sample_rate": 44100,
            "quality": "standard"
        },
        "professional": {
            "mp3_bitrate": 320,  # 320 kbps for professional tier
            "wav_bit_depth": 24,
            "sample_rate": 48000,
            "quality": "high"
        },
        "advanced": {
            "mp3_bitrate": 320,  # 320 kbps for advanced tier
            "wav_bit_depth": 32,
            "sample_rate": 96000,
            "quality": "premium"
        }
    }
    return settings.get(tier, settings["free"])

def process_audio_with_ffmpeg(input_file_path: str, output_file_path: str, tier: str, target_format: str) -> bool:
    """Process audio file with FFmpeg based on tier settings"""
    try:
        tier_settings = get_tier_bitrate_settings(tier)
        
        if target_format.upper() == "MP3":
            # MP3 processing with tier-specific bitrate
            bitrate = tier_settings["mp3_bitrate"]
            cmd = [
                "ffmpeg", "-i", input_file_path,
                "-codec:a", "libmp3lame",
                "-b:a", f"{bitrate}k",
                "-ar", str(tier_settings["sample_rate"]),
                "-y",  # Overwrite output file
                output_file_path
            ]
        else:
            # WAV processing with tier-specific bit depth and sample rate
            bit_depth = tier_settings["wav_bit_depth"]
            sample_rate = tier_settings["sample_rate"]
            cmd = [
                "ffmpeg", "-i", input_file_path,
                "-codec:a", "pcm_s16le" if bit_depth == 16 else "pcm_s24le" if bit_depth == 24 else "pcm_s32le",
                "-ar", str(sample_rate),
                "-y",  # Overwrite output file
                output_file_path
            ]
        
        logger.info(f"🎵 Processing audio with FFmpeg: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            logger.info(f"🎵 Audio processing successful: {output_file_path}")
            return True
        else:
            logger.error(f"🎵 FFmpeg error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("🎵 FFmpeg processing timed out")
        return False
    except Exception as e:
        logger.error(f"🎵 Audio processing failed: {str(e)}")
        return False

@app.post("/upload-file")
async def upload_file(
    audio: UploadFile = File(...),
    tier: str = Form(...),
    genre: str = Form(...),
    user_id: str = Form(...),
    is_preview: str = Form("false"),
    target_format: str = Form("MP3"),
    target_sample_rate: str = Form("44100"),
    target_lufs: Optional[str] = Form(None),
    mp3_bitrate_kbps: Optional[str] = Form(None),
    wav_bit_depth: Optional[str] = Form(None)
):
    """Upload and process audio file for mastering with real FFmpeg processing"""
    try:
        logger.info(f"🎵 Upload file request - Tier: {tier}, Genre: {genre}, User: {user_id}")
        
        # Get tier-specific settings
        tier_settings = get_tier_bitrate_settings(tier)
        
        # Use provided bitrate or default to tier setting
        final_mp3_bitrate = int(mp3_bitrate_kbps) if mp3_bitrate_kbps else tier_settings["mp3_bitrate"]
        final_wav_bit_depth = int(wav_bit_depth) if wav_bit_depth else tier_settings["wav_bit_depth"]
        final_sample_rate = int(target_sample_rate) if target_sample_rate else tier_settings["sample_rate"]
        
        logger.info(f"🎵 Bitrate settings - MP3: {final_mp3_bitrate}kbps, WAV: {final_wav_bit_depth}bit, Sample Rate: {final_sample_rate}Hz")
        
        # Validate file
        if not audio.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Get actual file size
        file_content = await audio.read()
        original_file_size = len(file_content)
        file_size_mb = original_file_size / (1024 * 1024)
        
        # Check file size based on tier
        max_size = {
            "free": 20,
            "professional": 200, 
            "advanced": 500
        }.get(tier, 20)
        
        if file_size_mb > max_size:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large for {tier} tier. Max size: {max_size}MB"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        original_filename = audio.filename
        file_extension = os.path.splitext(original_filename)[1]
        
        # Create temporary input file
        input_file_path = os.path.join(TEMP_DIR, f"input_{file_id}{file_extension}")
        with open(input_file_path, "wb") as f:
            f.write(file_content)
        
        # Create output file path
        output_extension = ".mp3" if target_format.upper() == "MP3" else ".wav"
        output_file_path = os.path.join(TEMP_DIR, f"{file_id}{output_extension}")
        
        # Process audio with FFmpeg
        logger.info(f"🎵 Starting real audio processing for {tier} tier...")
        processing_success = process_audio_with_ffmpeg(input_file_path, output_file_path, tier, target_format)
        
        if not processing_success:
            # Clean up input file
            if os.path.exists(input_file_path):
                os.remove(input_file_path)
            raise HTTPException(status_code=500, detail="Audio processing failed")
        
        # Get actual processed file size
        if os.path.exists(output_file_path):
            processed_file_size = os.path.getsize(output_file_path)
            processed_file_size_mb = processed_file_size / (1024 * 1024)
        else:
            processed_file_size = 0
            processed_file_size_mb = 0
        
        # Clean up input file
        if os.path.exists(input_file_path):
            os.remove(input_file_path)
        
        # Create response with real file sizes
        response = {
            "status": "success",
            "message": "File uploaded and processed successfully",
            "file_id": file_id,
            "original_filename": original_filename,
            "processed_filename": f"{file_id}{output_extension}",
            "tier": tier,
            "genre": genre,
            "user_id": user_id,
            "is_preview": is_preview == "true",
            "target_format": target_format,
            "target_sample_rate": final_sample_rate,
            "mp3_bitrate_kbps": final_mp3_bitrate,
            "wav_bit_depth": final_wav_bit_depth,
            "original_file_size_mb": round(file_size_mb, 2),
            "processed_file_size_mb": round(processed_file_size_mb, 2),
            "original_file_size_bytes": original_file_size,
            "processed_file_size_bytes": processed_file_size,
            "mastered_url": f"/files/{file_id}{output_extension}",
            "processing_time": 0.5,
            "quality_settings": tier_settings,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"🎵 Real processing successful - File ID: {file_id}, Original: {file_size_mb:.2f}MB, Processed: {processed_file_size_mb:.2f}MB")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/upload-file/")
async def upload_file_trailing_slash(
    audio: UploadFile = File(...),
    tier: str = Form(...),
    genre: str = Form(...),
    user_id: str = Form(...),
    is_preview: str = Form("false"),
    target_format: str = Form("MP3"),
    target_sample_rate: str = Form("44100"),
    target_lufs: Optional[str] = Form(None),
    mp3_bitrate_kbps: Optional[str] = Form(None),
    wav_bit_depth: Optional[str] = Form(None)
):
    """Upload and process audio file for mastering (with trailing slash)"""
    return await upload_file(
        audio=audio,
        tier=tier,
        genre=genre,
        user_id=user_id,
        is_preview=is_preview,
        target_format=target_format,
        target_sample_rate=target_sample_rate,
        target_lufs=target_lufs,
        mp3_bitrate_kbps=mp3_bitrate_kbps,
        wav_bit_depth=wav_bit_depth
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)

