"""
Simple Direct File Download Service
Recreates the working local download flow for live server
"""

import os
import tempfile
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Simple Download Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/download/{file_id}")
async def download_file(file_id: str):
    """Direct file download - simple and reliable"""
    try:
        # Look for the file in temp directory
        temp_dir = tempfile.gettempdir()
        possible_paths = [
            os.path.join(temp_dir, f"{file_id}.mp3"),
            os.path.join(temp_dir, f"{file_id}.wav"),
            os.path.join(temp_dir, f"mastered_{file_id}.mp3"),
            os.path.join(temp_dir, f"mastered_{file_id}.wav"),
            os.path.join("/tmp", f"{file_id}.mp3"),
            os.path.join("/tmp", f"{file_id}.wav"),
            os.path.join("/tmp", f"mastered_{file_id}.mp3"),
            os.path.join("/tmp", f"mastered_{file_id}.wav"),
        ]
        
        file_path = None
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                break
        
        if not file_path:
            logger.error(f"File not found for ID: {file_id}")
            logger.error(f"Searched paths: {possible_paths}")
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get file size for logging
        file_size = os.path.getsize(file_path)
        logger.info(f"Downloading file: {file_path} ({file_size} bytes)")
        
        # Return the file directly
        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type='application/octet-stream'
        )
        
    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "simple-download"}
