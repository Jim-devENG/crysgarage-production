"""
Crys Garage ML Audio Mastering Service
FastAPI-based microservice for intelligent audio mastering parameter prediction
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import librosa
import numpy as np
import json
import logging
import os
from pathlib import Path
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Crys Garage ML Mastering Service",
    description="AI-powered audio mastering parameter prediction",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AudioAnalysisRequest(BaseModel):
    audio_path: str
    genre: str
    tier: str
    file_size: float
    duration: float

class MasteringParameters(BaseModel):
    eq: Dict[str, float]
    compression: Dict[str, float]
    loudness: Dict[str, float]
    premium_effects: Optional[Dict[str, Any]] = None
    confidence: float
    processing_notes: str

class AnalysisResponse(BaseModel):
    success: bool
    parameters: MasteringParameters
    analysis_data: Dict[str, Any]
    processing_time: float

# Genre-specific mastering templates
GENRE_TEMPLATES = {
    "hip-hop": {
        "base_eq": {"low": 1.2, "mid": 1.0, "high": 0.9},
        "base_compression": {"threshold": -16, "ratio": 4, "attack": 0.001, "release": 0.1},
        "base_loudness": {"target_lufs": -7.8, "true_peak": -0.15},
        "characteristics": ["punchy_bass", "crisp_highs", "tight_mids"]
    },
    "afrobeats": {
        "base_eq": {"low": 1.0, "mid": 1.0, "high": 1.2},
        "base_compression": {"threshold": -18, "ratio": 3, "attack": 0.002, "release": 0.15},
        "base_loudness": {"target_lufs": -7.0, "true_peak": -0.1},
        "characteristics": ["bright_highs", "warm_mids", "tight_lows"]
    },
    "gospel": {
        "base_eq": {"low": 1.5, "mid": 2.0, "high": 1.0},
        "base_compression": {"threshold": -22, "ratio": 2.5, "attack": 0.01, "release": 0.15},
        "base_loudness": {"target_lufs": -8.5, "true_peak": -0.3},
        "characteristics": ["warm_mids", "clear_highs", "full_lows"]
    },
    "r-b": {
        "base_eq": {"low": 1.2, "mid": 2.5, "high": 1.8},
        "base_compression": {"threshold": -24, "ratio": 2.2, "attack": 0.015, "release": 0.2},
        "base_loudness": {"target_lufs": -8.8, "true_peak": -0.35},
        "characteristics": ["smooth_mids", "detailed_highs", "warm_lows"]
    }
}

# Tier-specific enhancements
TIER_ENHANCEMENTS = {
    "free": {
        "max_processing_time": 30,
        "available_effects": ["eq", "compression", "loudness"],
        "quality_level": "standard"
    },
    "pro": {
        "max_processing_time": 60,
        "available_effects": ["eq", "compression", "loudness", "stereo_widener"],
        "quality_level": "enhanced"
    },
    "advanced": {
        "max_processing_time": 120,
        "available_effects": ["eq", "compression", "loudness", "stereo_widener", 
                             "harmonic_exciter", "multiband_compression", "digital_tape"],
        "quality_level": "premium"
    }
}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Crys Garage ML Mastering Service",
        "status": "healthy",
        "version": "1.0.0",
        "available_genres": list(GENRE_TEMPLATES.keys()),
        "available_tiers": list(TIER_ENHANCEMENTS.keys())
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(request: AudioAnalysisRequest):
    """
    Analyze audio file and return intelligent mastering parameters
    """
    import time
    start_time = time.time()
    
    try:
        logger.info(f"🎵 Analyzing audio: {request.audio_path}")
        logger.info(f"Genre: {request.genre}, Tier: {request.tier}")
        
        # Validate inputs
        if not os.path.exists(request.audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        if request.genre not in GENRE_TEMPLATES:
            logger.warning(f"Unknown genre {request.genre}, using hip-hop as default")
            request.genre = "hip-hop"
        
        if request.tier not in TIER_ENHANCEMENTS:
            logger.warning(f"Unknown tier {request.tier}, using free as default")
            request.tier = "free"
        
        # Load and analyze audio
        analysis_data = await analyze_audio_features(request.audio_path)
        
        # Generate ML-based mastering parameters
        mastering_params = await generate_mastering_parameters(
            analysis_data, 
            request.genre, 
            request.tier
        )
        
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Analysis completed in {processing_time:.2f}s")
        
        return AnalysisResponse(
            success=True,
            parameters=mastering_params,
            analysis_data=analysis_data,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def analyze_audio_features(audio_path: str) -> Dict[str, Any]:
    """
    Extract audio features using librosa for ML analysis
    """
    try:
        # Load audio file
        y, sr = librosa.load(audio_path, sr=None)
        duration = len(y) / sr
        
        # Basic audio analysis
        analysis = {
            "duration": duration,
            "sample_rate": sr,
            "channels": 1 if y.ndim == 1 else 2,
            "rms_energy": float(np.sqrt(np.mean(y**2))),
            "zero_crossing_rate": float(np.mean(librosa.feature.zero_crossing_rate(y))),
            "spectral_centroid": float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))),
            "spectral_rolloff": float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))),
            "spectral_bandwidth": float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))),
            "mfcc": librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).mean(axis=1).tolist(),
            "chroma": librosa.feature.chroma_stft(y=y, sr=sr).mean(axis=1).tolist(),
            "tonnetz": librosa.feature.tonnetz(y=y, sr=sr).mean(axis=1).tolist()
        }
        
        # Dynamic range analysis
        analysis["dynamic_range"] = float(np.max(y) - np.min(y))
        analysis["peak_level"] = float(np.max(np.abs(y)))
        
        # Frequency analysis
        stft = librosa.stft(y)
        magnitude = np.abs(stft)
        analysis["frequency_balance"] = {
            "low": float(np.mean(magnitude[:len(magnitude)//4])),
            "mid": float(np.mean(magnitude[len(magnitude)//4:3*len(magnitude)//4])),
            "high": float(np.mean(magnitude[3*len(magnitude)//4:]))
        }
        
        # Stereo analysis (if applicable)
        if y.ndim == 2:
            left, right = y[0], y[1]
            analysis["stereo_width"] = float(np.mean(np.abs(left - right)))
            analysis["stereo_balance"] = float(np.mean(left) - np.mean(right))
        
        logger.info(f"📊 Audio analysis completed: {duration:.2f}s, {sr}Hz")
        return analysis
        
    except Exception as e:
        logger.error(f"❌ Audio analysis failed: {str(e)}")
        raise Exception(f"Audio analysis failed: {str(e)}")

async def generate_mastering_parameters(
    analysis_data: Dict[str, Any], 
    genre: str, 
    tier: str
) -> MasteringParameters:
    """
    Generate intelligent mastering parameters based on audio analysis
    """
    try:
        # Get base template for genre
        base_template = GENRE_TEMPLATES[genre]
        tier_config = TIER_ENHANCEMENTS[tier]
        
        # Start with base parameters
        eq_params = base_template["base_eq"].copy()
        compression_params = base_template["base_compression"].copy()
        loudness_params = base_template["base_loudness"].copy()
        
        # Apply ML-based adjustments based on audio analysis
        eq_params = apply_ml_eq_adjustments(eq_params, analysis_data, genre)
        compression_params = apply_ml_compression_adjustments(compression_params, analysis_data, genre)
        loudness_params = apply_ml_loudness_adjustments(loudness_params, analysis_data, genre)
        
        # Add tier-specific premium effects
        premium_effects = None
        if tier == "advanced":
            premium_effects = generate_premium_effects(analysis_data, genre)
        elif tier == "pro":
            premium_effects = generate_pro_effects(analysis_data, genre)
        
        # Calculate confidence score
        confidence = calculate_confidence_score(analysis_data, genre)
        
        # Generate processing notes
        processing_notes = generate_processing_notes(analysis_data, genre, tier)
        
        return MasteringParameters(
            eq=eq_params,
            compression=compression_params,
            loudness=loudness_params,
            premium_effects=premium_effects,
            confidence=confidence,
            processing_notes=processing_notes
        )
        
    except Exception as e:
        logger.error(f"❌ Parameter generation failed: {str(e)}")
        raise Exception(f"Parameter generation failed: {str(e)}")

def apply_ml_eq_adjustments(base_eq: Dict[str, float], analysis: Dict[str, Any], genre: str) -> Dict[str, float]:
    """
    Apply ML-based EQ adjustments based on frequency analysis
    """
    freq_balance = analysis.get("frequency_balance", {})
    
    # Adjust based on frequency balance
    if freq_balance.get("low", 0) < 0.1:
        base_eq["low"] *= 1.2  # Boost low frequencies
    elif freq_balance.get("low", 0) > 0.3:
        base_eq["low"] *= 0.8  # Reduce low frequencies
    
    if freq_balance.get("high", 0) < 0.1:
        base_eq["high"] *= 1.1  # Boost high frequencies
    elif freq_balance.get("high", 0) > 0.3:
        base_eq["high"] *= 0.9  # Reduce high frequencies
    
    # Genre-specific adjustments
    if genre == "hip-hop" and analysis.get("dynamic_range", 0) > 0.8:
        base_eq["low"] *= 1.1  # Extra bass for punchy hip-hop
    
    if genre == "afrobeats" and analysis.get("spectral_centroid", 0) > 2000:
        base_eq["high"] *= 1.15  # Brighten highs for afrobeats
    
    return base_eq

def apply_ml_compression_adjustments(
    base_compression: Dict[str, float], 
    analysis: Dict[str, Any], 
    genre: str
) -> Dict[str, float]:
    """
    Apply ML-based compression adjustments based on dynamic range
    """
    dynamic_range = analysis.get("dynamic_range", 0.5)
    rms_energy = analysis.get("rms_energy", 0.1)
    
    # Adjust compression based on dynamic range
    if dynamic_range > 0.8:
        base_compression["ratio"] *= 1.2  # More compression for high dynamic range
        base_compression["threshold"] += 2  # Lower threshold
    elif dynamic_range < 0.3:
        base_compression["ratio"] *= 0.8  # Less compression for low dynamic range
        base_compression["threshold"] -= 2  # Higher threshold
    
    # Adjust attack/release based on genre characteristics
    if genre in ["hip-hop", "trap"]:
        base_compression["attack"] *= 0.5  # Faster attack for punch
        base_compression["release"] *= 0.7  # Faster release
    elif genre in ["gospel", "r-b"]:
        base_compression["attack"] *= 1.5  # Slower attack for smoothness
        base_compression["release"] *= 1.3  # Slower release
    
    return base_compression

def apply_ml_loudness_adjustments(
    base_loudness: Dict[str, float], 
    analysis: Dict[str, Any], 
    genre: str
) -> Dict[str, float]:
    """
    Apply ML-based loudness adjustments based on RMS energy and genre
    """
    rms_energy = analysis.get("rms_energy", 0.1)
    peak_level = analysis.get("peak_level", 0.5)
    
    # Adjust target LUFS based on current energy
    if rms_energy < 0.1:
        base_loudness["target_lufs"] -= 1  # Louder target for quiet tracks
    elif rms_energy > 0.3:
        base_loudness["target_lufs"] += 1  # Quieter target for loud tracks
    
    # Genre-specific loudness targets
    if genre in ["hip-hop", "trap", "drill"]:
        base_loudness["target_lufs"] -= 0.5  # Louder for aggressive genres
    elif genre in ["gospel", "jazz"]:
        base_loudness["target_lufs"] += 0.5  # Quieter for dynamic genres
    
    # Adjust true peak based on current peak level
    if peak_level > 0.8:
        base_loudness["true_peak"] -= 0.1  # Lower true peak for hot tracks
    
    return base_loudness

def generate_premium_effects(analysis: Dict[str, Any], genre: str) -> Dict[str, Any]:
    """
    Generate premium effects for Advanced tier
    """
    effects = {}
    
    # Stereo widener based on stereo width
    stereo_width = analysis.get("stereo_width", 0.1)
    if stereo_width < 0.05:
        effects["stereo_widener"] = {"width": 1.2}
    elif stereo_width > 0.2:
        effects["stereo_widener"] = {"width": 0.9}
    else:
        effects["stereo_widener"] = {"width": 1.0}
    
    # Harmonic exciter based on spectral content
    spectral_centroid = analysis.get("spectral_centroid", 1000)
    if spectral_centroid < 1000:
        effects["harmonic_exciter"] = {"amount": 0.4, "frequency": 5000}
    else:
        effects["harmonic_exciter"] = {"amount": 0.2, "frequency": 8000}
    
    # Multiband compression
    effects["multiband_compression"] = {
        "low": {"threshold": -20, "ratio": 4, "frequency": 200},
        "mid": {"threshold": -18, "ratio": 3, "frequency": 2000},
        "high": {"threshold": -16, "ratio": 2, "frequency": 8000}
    }
    
    # Digital tape saturation for warmth
    if genre in ["gospel", "r-b", "jazz"]:
        effects["digital_tape"] = {
            "saturation": 0.3,
            "warmth": 0.4,
            "compression": 0.2
        }
    
    return effects

def generate_pro_effects(analysis: Dict[str, Any], genre: str) -> Dict[str, Any]:
    """
    Generate enhanced effects for Pro tier
    """
    effects = {}
    
    # Basic stereo widener
    stereo_width = analysis.get("stereo_width", 0.1)
    if stereo_width < 0.1:
        effects["stereo_widener"] = {"width": 1.1}
    
    # Light harmonic enhancement
    if genre in ["afrobeats", "hip-hop"]:
        effects["harmonic_exciter"] = {"amount": 0.2, "frequency": 6000}
    
    return effects

def calculate_confidence_score(analysis: Dict[str, Any], genre: str) -> float:
    """
    Calculate confidence score for the mastering parameters
    """
    confidence = 0.7  # Base confidence
    
    # Increase confidence based on audio quality
    if analysis.get("sample_rate", 0) >= 44100:
        confidence += 0.1
    
    if analysis.get("duration", 0) > 30:  # Longer tracks are easier to analyze
        confidence += 0.1
    
    if analysis.get("dynamic_range", 0) > 0.3:  # Good dynamic range
        confidence += 0.1
    
    # Decrease confidence for problematic audio
    if analysis.get("rms_energy", 0) < 0.05:  # Very quiet
        confidence -= 0.1
    
    if analysis.get("peak_level", 0) > 0.95:  # Clipped
        confidence -= 0.2
    
    return max(0.1, min(1.0, confidence))

def generate_processing_notes(analysis: Dict[str, Any], genre: str, tier: str) -> str:
    """
    Generate human-readable processing notes
    """
    notes = []
    
    # Audio quality notes
    if analysis.get("sample_rate", 0) >= 96000:
        notes.append("High-resolution audio detected")
    elif analysis.get("sample_rate", 0) < 44100:
        notes.append("Low sample rate detected - consider higher quality source")
    
    # Dynamic range notes
    dynamic_range = analysis.get("dynamic_range", 0.5)
    if dynamic_range > 0.8:
        notes.append("High dynamic range - aggressive compression applied")
    elif dynamic_range < 0.2:
        notes.append("Low dynamic range - gentle compression applied")
    
    # Genre-specific notes
    if genre == "hip-hop":
        notes.append("Hip-hop preset: Enhanced bass and punch")
    elif genre == "afrobeats":
        notes.append("Afrobeats preset: Bright highs and warm mids")
    elif genre == "gospel":
        notes.append("Gospel preset: Warm and dynamic")
    
    # Tier-specific notes
    if tier == "advanced":
        notes.append("Advanced tier: Premium effects and multi-band processing")
    elif tier == "pro":
        notes.append("Pro tier: Enhanced processing with stereo enhancement")
    else:
        notes.append("Free tier: Basic mastering with genre optimization")
    
    return "; ".join(notes)

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "ml-mastering",
        "version": "1.0.0",
        "dependencies": {
            "librosa": "available",
            "numpy": "available",
            "fastapi": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
