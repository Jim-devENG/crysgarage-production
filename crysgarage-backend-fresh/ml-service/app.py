from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import logging
from typing import Dict, Any
import tempfile
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Crys Garage ML Service",
    description="ML-powered audio analysis and mastering recommendations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "crys-garage-ml",
        "version": "1.0.0"
    }

@app.post("/analyze")
async def analyze_audio(
    audio: UploadFile = File(...),
    tier: str = Form("free"),
    genre: str = Form("general")
):
    """
    Analyze audio and provide mastering recommendations
    """
    try:
        logger.info(f"Analyzing audio: {audio.filename}, tier: {tier}, genre: {genre}")
        
        # For now, return mock recommendations based on tier and genre
        recommendations = generate_mock_recommendations(tier, genre)
        
        logger.info(f"Analysis complete for {audio.filename}")
        
        return {
            "status": "success",
            "filename": audio.filename,
            "recommendations": recommendations,
            "tier": tier,
            "genre": genre
        }
        
    except Exception as e:
        logger.error(f"Error analyzing audio: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

def generate_mock_recommendations(tier: str, genre: str) -> Dict[str, Any]:
    """
    Generate mock mastering recommendations based on tier and genre
    """
    # Base recommendations
    recommendations = {
        "eq": {"low": 1.0, "mid": 1.0, "high": 1.0},
        "compression": {"ratio": 2.0, "threshold": -12.0, "attack": 5, "release": 50},
        "limiter": {"threshold": -0.3, "release": 50},
        "genre": genre
    }
    
    # Genre-specific adjustments
    genre_adjustments = {
        "hip_hop": {
            "eq": {"low": 1.3, "mid": 0.9, "high": 1.1},
            "compression": {"ratio": 4.0, "threshold": -10.0}
        },
        "afrobeats": {
            "eq": {"low": 1.1, "mid": 1.2, "high": 1.3},
            "compression": {"ratio": 3.0, "threshold": -12.0}
        },
        "gospel": {
            "eq": {"low": 1.0, "mid": 1.1, "high": 1.0},
            "compression": {"ratio": 2.5, "threshold": -14.0}
        },
        "highlife": {
            "eq": {"low": 1.0, "mid": 1.0, "high": 1.2},
            "compression": {"ratio": 2.0, "threshold": -12.0}
        }
    }
    
    if genre in genre_adjustments:
        genre_rec = genre_adjustments[genre]
        recommendations["eq"].update(genre_rec["eq"])
        recommendations["compression"].update(genre_rec["compression"])
    
    # Tier-specific adjustments
    if tier == "pro":
        recommendations["compression"]["ratio"] *= 1.2
        recommendations["limiter"]["threshold"] = -0.5
    elif tier == "advanced":
        recommendations["compression"]["ratio"] *= 1.5
        recommendations["limiter"]["threshold"] = -0.8
        recommendations["stereo_width"] = 1.1
        recommendations["harmonic_exciter"] = {"amount": 0.1}
    
    return recommendations

@app.get("/genres")
async def get_supported_genres():
    """Get list of supported genres"""
    return {
        "genres": [
            "hip_hop",
            "afrobeats", 
            "gospel",
            "highlife",
            "r_b",
            "general"
        ]
    }

@app.get("/tiers")
async def get_supported_tiers():
    """Get list of supported tiers"""
    return {
        "tiers": [
            "free",
            "pro", 
            "advanced"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=5000,
        log_level="info"
    )
