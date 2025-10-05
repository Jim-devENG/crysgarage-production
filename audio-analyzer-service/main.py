#!/usr/bin/env python3
"""
CrysGarage Audio Analyzer Service
Professional audio analysis using ITU-R BS.1770 and advanced signal processing
"""

import os
import sys
import asyncio
import tempfile
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Core dependencies
import numpy as np
import scipy
from scipy import signal
from scipy.fft import fft, fftfreq
from pydub import AudioSegment
from pydub.utils import which
import pyloudnorm as pyln

# Optional visualization
try:
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

# FastAPI
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CrysGarage Audio Analyzer",
    description="Professional audio analysis service using ITU-R BS.1770",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioAnalyzer:
    """Professional audio analyzer using ITU-R BS.1770 and advanced signal processing"""
    
    def __init__(self):
        self.supported_formats = ['.wav', '.mp3', '.flac', '.aiff', '.m4a']
        
    def load_audio(self, file_path: str) -> AudioSegment:
        """Load audio file using pydub"""
        try:
            audio = AudioSegment.from_file(file_path)
            logger.info(f"Loaded audio: {len(audio)}ms, {audio.frame_rate}Hz, {audio.channels}ch")
            return audio
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to load audio: {str(e)}")
    
    def get_basic_info(self, audio: AudioSegment) -> Dict[str, Any]:
        """Get basic audio information"""
        return {
            "duration": len(audio) / 1000.0,  # seconds
            "sample_rate": audio.frame_rate,
            "channels": audio.channels,
            "bit_depth": audio.sample_width * 8,
            "format": audio.frame_rate,
            "file_size": len(audio.raw_data)
        }
    
    def calculate_lufs(self, audio: AudioSegment) -> float:
        """Calculate LUFS using pyloudnorm (ITU-R BS.1770)"""
        try:
            # Convert to numpy array
            samples = np.array(audio.get_array_of_samples())
            
            # Reshape for multi-channel
            if audio.channels > 1:
                samples = samples.reshape((-1, audio.channels))
            
            # Create loudness meter
            meter = pyln.Meter(audio.frame_rate)
            
            # Calculate LUFS
            lufs = meter.integrated_loudness(samples)
            
            logger.info(f"LUFS calculated: {lufs:.2f}")
            return float(lufs)
            
        except Exception as e:
            logger.error(f"LUFS calculation failed: {e}")
            return -70.0  # Default quiet value
    
    def calculate_peak_rms(self, audio: AudioSegment) -> Dict[str, float]:
        """Calculate peak and RMS levels"""
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        
        # Normalize to -1 to 1 range
        max_val = np.iinfo(np.int16).max if audio.sample_width == 2 else np.iinfo(np.int32).max
        samples = samples / max_val
        
        # Calculate peak
        peak = np.max(np.abs(samples))
        peak_db = 20 * np.log10(peak + 1e-12)
        
        # Calculate RMS
        rms = np.sqrt(np.mean(samples ** 2))
        rms_db = 20 * np.log10(rms + 1e-12)
        
        # Calculate true peak (oversampling)
        upsampled = signal.resample(samples, len(samples) * 4)
        true_peak = np.max(np.abs(upsampled))
        true_peak_db = 20 * np.log10(true_peak + 1e-12)
        
        return {
            "peak": float(peak_db),
            "true_peak": float(true_peak_db),
            "rms": float(rms_db),
            "crest_factor": float(peak_db - rms_db)
        }
    
    def analyze_frequency_content(self, audio: AudioSegment) -> Dict[str, float]:
        """Analyze frequency content using FFT"""
        # Convert to mono for analysis
        if audio.channels > 1:
            mono_audio = audio.set_channels(1)
        else:
            mono_audio = audio
        
        # Get samples
        samples = np.array(mono_audio.get_array_of_samples(), dtype=np.float32)
        max_val = np.iinfo(np.int16).max if mono_audio.sample_width == 2 else np.iinfo(np.int32).max
        samples = samples / max_val
        
        # Apply window and FFT
        windowed = samples * signal.windows.hann(len(samples))
        fft_result = fft(windowed)
        freqs = fftfreq(len(samples), 1/audio.frame_rate)
        
        # Get magnitude spectrum
        magnitude = np.abs(fft_result)
        
        # Calculate frequency bands
        nyquist = audio.frame_rate / 2
        
        # Bass: 20Hz - 250Hz
        bass_mask = (freqs >= 20) & (freqs <= 250)
        bass_energy = np.sum(magnitude[bass_mask])
        
        # Mid: 250Hz - 4kHz
        mid_mask = (freqs > 250) & (freqs <= 4000)
        mid_energy = np.sum(magnitude[mid_mask])
        
        # High: 4kHz - 20kHz
        high_mask = (freqs > 4000) & (freqs <= nyquist)
        high_energy = np.sum(magnitude[high_mask])
        
        total_energy = bass_energy + mid_energy + high_energy
        
        if total_energy == 0:
            return {"bass": 0.0, "mid": 0.0, "high": 0.0}
        
        return {
            "bass": float((bass_energy / total_energy) * 100),
            "mid": float((mid_energy / total_energy) * 100),
            "high": float((high_energy / total_energy) * 100)
        }
    
    def detect_silence(self, audio: AudioSegment, silence_thresh: int = -50) -> Dict[str, Any]:
        """Detect silence using pydub"""
        try:
            # Split on silence
            chunks = pydub.silence.split_on_silence(
                audio,
                min_silence_len=100,  # 100ms
                silence_thresh=silence_thresh,
                keep_silence=50  # Keep 50ms of silence
            )
            
            total_silence = 0
            for i, chunk in enumerate(chunks):
                if len(chunk) < 100:  # Very short chunks are likely silence
                    total_silence += len(chunk)
            
            silence_percentage = (total_silence / len(audio)) * 100
            
            return {
                "silence_percentage": float(silence_percentage),
                "chunks_count": len(chunks),
                "has_silence": silence_percentage > 10
            }
            
        except Exception as e:
            logger.error(f"Silence detection failed: {e}")
            return {
                "silence_percentage": 0.0,
                "chunks_count": 1,
                "has_silence": False
            }
    
    def analyze_dynamics(self, audio: AudioSegment) -> Dict[str, Any]:
        """Analyze dynamic range and compression"""
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        max_val = np.iinfo(np.int16).max if audio.sample_width == 2 else np.iinfo(np.int32).max
        samples = samples / max_val
        
        # Calculate RMS over time windows
        window_size = int(audio.frame_rate * 0.1)  # 100ms windows
        rms_values = []
        
        for i in range(0, len(samples), window_size):
            window = samples[i:i + window_size]
            if len(window) > 0:
                rms = np.sqrt(np.mean(window ** 2))
                rms_values.append(20 * np.log10(rms + 1e-12))
        
        if not rms_values:
            return {"dynamic_range": 0, "compression_level": "Unknown"}
        
        # Calculate dynamic range
        max_rms = np.max(rms_values)
        min_rms = np.min(rms_values)
        dynamic_range = max_rms - min_rms
        
        # Determine compression level
        if dynamic_range < 6:
            compression_level = "Heavy"
        elif dynamic_range < 12:
            compression_level = "Medium"
        else:
            compression_level = "Light"
        
        return {
            "dynamic_range": float(dynamic_range),
            "compression_level": compression_level,
            "max_rms": float(max_rms),
            "min_rms": float(min_rms)
        }
    
    def generate_analysis_report(self, audio: AudioSegment) -> Dict[str, Any]:
        """Generate comprehensive analysis report"""
        logger.info("Starting comprehensive audio analysis...")
        
        # Basic information
        basic_info = self.get_basic_info(audio)
        
        # LUFS measurement
        lufs = self.calculate_lufs(audio)
        
        # Peak and RMS
        levels = self.calculate_peak_rms(audio)
        
        # Frequency content
        frequency_content = self.analyze_frequency_content(audio)
        
        # Silence detection
        silence_info = self.detect_silence(audio)
        
        # Dynamics analysis
        dynamics = self.analyze_dynamics(audio)
        
        # LUFS category
        if lufs > -14:
            lufs_category = "Very Loud"
        elif lufs > -16:
            lufs_category = "Loud"
        elif lufs > -18:
            lufs_category = "Normal"
        else:
            lufs_category = "Quiet"
        
        return {
            "timestamp": datetime.now().isoformat(),
            "basic_info": basic_info,
            "loudness": {
                "lufs": lufs,
                "category": lufs_category
            },
            "levels": levels,
            "frequency_content": frequency_content,
            "silence": silence_info,
            "dynamics": dynamics,
            "analysis_quality": "Professional (ITU-R BS.1770)"
        }

# Initialize analyzer
analyzer = AudioAnalyzer()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CrysGarage Audio Analyzer",
        "version": "1.0.0",
        "status": "running",
        "libraries": {
            "pydub": "✓",
            "numpy": "✓",
            "scipy": "✓",
            "pyloudnorm": "✓",
            "matplotlib": "✓" if MATPLOTLIB_AVAILABLE else "✗"
        }
    }

@app.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    user_id: str = Form("anonymous")
):
    """Analyze uploaded audio file"""
    try:
        # Validate file type
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in analyzer.supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported format: {file_ext}. Supported: {analyzer.supported_formats}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Load and analyze audio
            audio = analyzer.load_audio(temp_file_path)
            analysis_result = analyzer.generate_analysis_report(audio)
            
            logger.info(f"Analysis completed for {file.filename}")
            return JSONResponse(content=analysis_result)
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "dependencies": {
            "pydub": "available",
            "numpy": f"v{np.__version__}",
            "scipy": f"v{scipy.__version__}",
            "pyloudnorm": "available",
            "matplotlib": "available" if MATPLOTLIB_AVAILABLE else "not available"
        }
    }

if __name__ == "__main__":
    # Check dependencies
    logger.info("Checking dependencies...")
    
    try:
        import pydub
        logger.info("✓ pydub available")
    except ImportError:
        logger.error("✗ pydub not available")
        sys.exit(1)
    
    try:
        import pyloudnorm
        logger.info("✓ pyloudnorm available")
    except ImportError:
        logger.error("✗ pyloudnorm not available")
        sys.exit(1)
    
    logger.info("All dependencies available. Starting server...")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8003,
        log_level="info"
    )

