#!/usr/bin/env python3
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import json

# Add the main backend to path for importing
sys.path.append('/var/www/crysgarage/audio-mastering-service')
from unified_backend import process_audio_file, TIER_CONFIGS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CrysGarage API",
    description="Professional Audio Mastering API for Developers",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Security
security = HTTPBearer()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key Management
API_KEYS_DB = "/var/www/crysgarage-api/api_keys.json"

def load_api_keys():
    if os.path.exists(API_KEYS_DB):
        with open(API_KEYS_DB, 'r') as f:
            return json.load(f)
    return {}

def save_api_keys(keys):
    with open(API_KEYS_DB, 'w') as f:
        json.dump(keys, f, indent=2)

def generate_api_key():
    return secrets.token_urlsafe(32)

def verify_api_key(api_key: str) -> bool:
    keys = load_api_keys()
    return keys.get(api_key, {})

# Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "service": "CrysGarage API"
    }

# API Information
@app.get("/api/v1/info")
async def api_info():
    return {
        "name": "CrysGarage API",
        "version": "1.0.0",
        "description": "Professional Audio Mastering API",
        "capabilities": [
            "Audio mastering for all tiers",
            "Multiple audio formats support",
            "Real-time processing status",
            "Usage analytics"
        ],
        "supported_formats": ["WAV", "MP3", "FLAC", "AAC", "OGG"],
        "tiers": list(TIER_CONFIGS.keys()),
        "documentation": "/api/docs"
    }

# Get Available Tiers
@app.get("/api/v1/tiers")
async def get_tiers():
    return {
        "tiers": TIER_CONFIGS,
        "default_tier": "professional",
        "recommended_tier": "professional"
    }


@app.get( /tiers)
async def get_tiers_simple():
    return {
        tiers: TIER_CONFIGS,
        default_tier: professional,
        recommended_tier: professional
    }
# Audio Mastering Endpoint
@app.post("/api/v1/master")
async def master_audio(
    file: UploadFile = File(...),
    tier: str = Form("professional"),
    genre: str = Form("default"),
    format: str = Form("wav"),
    sample_rate: int = Form(44100)
):
    try:
        # Generate unique file ID
        file_id = secrets.token_urlsafe(16)
        
        # Save uploaded file
        upload_dir = "/var/www/crysgarage-api/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        input_path = os.path.join(upload_dir, f"{file_id}_input{file_extension}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process audio
        output_dir = "/var/www/crysgarage-api/processed"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{file_id}_mastered.wav")
        
        # Use the existing processing function
        process_audio_file(input_path, output_path, tier, genre)
        
        # Generate download URL
        download_url = f"https://crysgarage.studio/api/v1/download/{file_id}"
        
        # Clean up input file
        os.remove(input_path)
        
        return {
            "success": True,
            "file_id": file_id,
            "download_url": download_url,
            "tier": tier,
            "genre": genre,
            "format": format,
            "sample_rate": sample_rate,
            "processing_time": "completed",
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Mastering error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}"
        )

# Download Processed File
@app.get("/api/v1/download/{file_id}")
async def download_file(file_id: str):
    output_dir = "/var/www/crysgarage-api/processed"
    file_path = os.path.join(output_dir, f"{file_id}_mastered.wav")
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found or expired"
        )
    
    return FileResponse(
        path=file_path,
        filename=f"mastered_{file_id}.wav",
        media_type="audio/wav"
    )

# Get Processing Status
@app.get("/api/v1/status/{file_id}")
async def get_processing_status(file_id: str):
    output_dir = "/var/www/crysgarage-api/processed"
    file_path = os.path.join(output_dir, f"{file_id}_mastered.wav")
    
    if os.path.exists(file_path):
        return {
            "file_id": file_id,
            "status": "completed",
            "download_url": f"https://crysgarage.studio/api/v1/download/{file_id}",
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }
    else:
        return {
            "file_id": file_id,
            "status": "processing",
            "message": "File is being processed"
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
