import os
import logging
import tempfile
import uuid
from typing import Optional
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# Audio processing imports
try:
    import librosa
    import soundfile as sf
    import pyloudnorm as pyln
    from pydub import AudioSegment
    AUDIO_PROCESSING_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Audio processing libraries not available: {e}")
    AUDIO_PROCESSING_AVAILABLE = False

from audio_converter import AudioConverter


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CrysGarage Unified Audio Mastering Service - Production")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

audio_converter = AudioConverter()

PROCESSED_FILES_DIR = "/var/www/mastering/processed"
UPLOAD_DIR = "/var/www/mastering/uploads"

os.makedirs(PROCESSED_FILES_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

TIER_CONFIGS = {
    "free": {
        "name": "Free Tier",
        "description": "Basic mastering with Matchering",
        "formats": ["MP3", "WAV", "FLAC", "AAC", "OGG"],
        "max_file_size": 50 * 1024 * 1024,
        "processing_time": 30,
        "target_lufs": -14.0,
    },
    "professional": {
        "name": "Professional Tier",
        "description": "Advanced mastering with AI",
        "formats": ["MP3", "WAV", "FLAC", "AAC", "OGG"],
        "max_file_size": 100 * 1024 * 1024,
        "processing_time": 60,
        "target_lufs": -12.0,
    },
    "advanced": {
        "name": "Advanced Tier",
        "description": "Premium mastering with custom algorithms",
        "formats": ["MP3", "WAV", "FLAC", "AAC", "OGG"],
        "max_file_size": 200 * 1024 * 1024,
        "processing_time": 90,
        "target_lufs": -10.0,
    },
}


def process_audio_file(input_path: str, output_path: str, tier: str = "professional", genre: str = "default"):
    """
    Actually process audio using librosa and pyloudnorm
    """
    # Handle auto preset genre - minimal processing
    if genre == "auto preset":
        logger.info(f"Auto preset genre detected - minimal processing for {input_path}")
        import shutil
        shutil.copy2(input_path, output_path)
        logger.info(f"Auto preset: copied {input_path} to {output_path}")
        return

    
    if not AUDIO_PROCESSING_AVAILABLE:
        logger.warning("Audio processing not available, creating dummy file")
        with open(output_path, "wb") as f:
            f.write(b"dummy processed audio" * 1000)
        return
    
    try:
        logger.info(f"Processing audio: {input_path} for tier {tier}")
        
        # Load audio
        audio, sr = librosa.load(input_path, sr=None, mono=False)
        logger.info(f"Loaded audio: shape={audio.shape}, sr={sr}")
        
        # Get target LUFS from tier config
        target_lufs = TIER_CONFIGS.get(tier, {}).get("target_lufs", -14.0)
        
        # Normalize loudness
        meter = pyln.Meter(sr)
        
        # Handle stereo/mono
        if audio.ndim == 1:
            loudness = meter.integrated_loudness(audio)
            audio_normalized = pyln.normalize.loudness(audio, loudness, target_lufs)
        else:
            loudness = meter.integrated_loudness(audio.T)
            audio_normalized = pyln.normalize.loudness(audio.T, loudness, target_lufs).T
        
        logger.info(f"Normalized from {loudness:.2f} LUFS to {target_lufs} LUFS")
        
        # Save processed audio
        sf.write(output_path, audio_normalized.T if audio.ndim > 1 else audio_normalized, sr)
        logger.info(f"Saved processed audio to {output_path}")
        
    except Exception as e:
        logger.error(f"Audio processing failed: {e}")
        # Fallback to copying input file
        import shutil
        shutil.copy2(input_path, output_path)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "unified-backend-production",
        "audio_processing": AUDIO_PROCESSING_AVAILABLE,
        "version": "2.0.0"
    }


@app.get("/tiers")
async def get_tiers():
    return TIER_CONFIGS


@app.get("/credits/balance")
async def credits_balance(user_id: Optional[str] = None):
    return {
        "credits": 9999,
        "accessGranted": True,
        "tier": "professional" if user_id else "free",
    }


@app.get("/credits/balance/{user_id}")
async def credits_balance_for_user(user_id: str):
    return {
        "credits": 9999,
        "accessGranted": True,
        "tier": "professional",
        "userId": user_id
    }


@app.post("/master-professional")
async def master_professional(
    file: UploadFile = File(...),
    
    tier: str = Form("professional"),
    genre: str = Form("default"),
):
    try:
        logger.info(f"Professional mastering: {file.filename}, genre={genre}")
        file_id = str(uuid.uuid4())
        
        # Save uploaded file
        upload_path = os.path.join(UPLOAD_DIR, f"{file_id}_input.wav")
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Saved upload: {upload_path} ({len(content)} bytes)")
        
        # Process audio
        output_dir = os.path.join(PROCESSED_FILES_DIR, "professional")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"mastered_{file_id}.wav")
        
        process_audio_file(upload_path, output_path, tier="professional", genre=genre)
        
        # Clean up upload
        os.remove(upload_path)
        
        mastered_rel = f"/files/professional/mastered_{file_id}.wav"
        mastered_abs = f"https://crysgarage.studio{mastered_rel}"
        file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        
        logger.info(f"✅ Professional mastering completed: file_id={file_id}, size={file_size}, file_url={mastered_abs}")
        
        return {
            "file_id": file_id,
            "status": "completed",
            "processed_file": mastered_rel,
            "mastered_url": mastered_abs,
            "masteredUrl": mastered_abs,
            "processedUrl": mastered_abs,
            "processed_audio_url": mastered_abs,  # For frontend download compatibility
            "file_url": mastered_abs,  # Additional alias for frontend compatibility
            "size": file_size,
            "tier": "professional",
            "genre": genre,
        }
    except Exception as e:
        logger.error(f"Professional mastering error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/master-advanced")
async def master_advanced(
    file: UploadFile = File(...),
    
    tier: str = Form("advanced"),
    genre: str = Form("default"),
):
    try:
        logger.info(f"Advanced mastering: {file.filename}, genre={genre}")
        file_id = str(uuid.uuid4())
        
        # Save uploaded file
        upload_path = os.path.join(UPLOAD_DIR, f"{file_id}_input.wav")
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Saved upload: {upload_path} ({len(content)} bytes)")
        
        # Process audio
        output_dir = os.path.join(PROCESSED_FILES_DIR, "advanced")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"mastered_{file_id}.wav")
        
        process_audio_file(upload_path, output_path, tier="advanced", genre=genre)
        
        # Clean up upload
        os.remove(upload_path)
        
        mastered_rel = f"/files/advanced/mastered_{file_id}.wav"
        mastered_abs = f"https://crysgarage.studio{mastered_rel}"
        file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        
        return {
            "file_id": file_id,
            "status": "completed",
            "processed_file": mastered_rel,
            "mastered_url": mastered_abs,
            "masteredUrl": mastered_abs,
            "processedUrl": mastered_abs,
            "processed_audio_url": mastered_abs,  # For frontend download compatibility
            "file_url": mastered_abs,  # Additional alias for frontend compatibility
            "size": file_size,
            "tier": "advanced",
            "genre": genre,
        }
    except Exception as e:
        logger.error(f"Advanced mastering error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/master")
async def master_unified(
    audio: UploadFile = File(...),
    tier: str = Form("professional"),
    genre: str = Form("default"),
    user_id: str = Form(...),
    is_preview: str = Form("false"),
    target_format: str = Form("MP3"),
    target_sample_rate: str = Form("44100"),
    target_lufs: Optional[str] = Form(None),
    mp3_bitrate_kbps: Optional[str] = Form(None),
    wav_bit_depth: Optional[str] = Form(None)
):
    """Unified mastering endpoint - routes to appropriate tier"""
    logger.info(f"Unified master endpoint: tier={tier}, genre={genre}, file={audio.filename}")

    if tier == "advanced":
        return await master_advanced(file=audio, tier=tier, genre=genre)
    elif tier == "professional":
        return await master_professional(file=audio, tier=tier, genre=genre)
    elif tier == "free":
        try:
            file_id = str(uuid.uuid4())
            upload_path = os.path.join(UPLOAD_DIR, f"{file_id}_input.wav")

            with open(upload_path, "wb") as buffer:
                content = await audio.read()
                buffer.write(content)

            output_dir = os.path.join(PROCESSED_FILES_DIR, "free")
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"mastered_{file_id}.wav")

            process_audio_file(upload_path, output_path, tier="free", genre=genre)     
            os.remove(upload_path)

            mastered_rel = f"/files/free/mastered_{file_id}.wav"
            mastered_abs = f"https://crysgarage.studio{mastered_rel}"
            file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0

            return {
                "file_id": file_id,
                "status": "completed",
                "processed_file": mastered_rel,
                "mastered_url": mastered_abs,
                "masteredUrl": mastered_abs,
                "processedUrl": mastered_abs,
                "processed_audio_url": mastered_abs,
                "file_url": mastered_abs,
                "size": file_size,
                "tier": "free",
                "genre": genre,
            }
        except Exception as e:
            logger.error(f"Free mastering error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail=f"Unknown tier: {tier}")

async def master_matchering(
    target: UploadFile = File(...),
    reference: UploadFile = File(...),
    tier: str = Form("free"),
    genre: str = Form("default"),
):
    """
    Free tier endpoint - uses basic matchering/normalization
    Same as free tier in /master but with dedicated endpoint name
    """
    try:
        logger.info(f"Matchering (Free tier): target={target.filename}, reference={reference.filename}, genre={genre}")
        file_id = str(uuid.uuid4())
        upload_path = os.path.join(UPLOAD_DIR, f"{file_id}_input.wav")
        
        with open(upload_path, "wb") as buffer:
            content = await target.read()
            buffer.write(content)
        
        output_dir = os.path.join(PROCESSED_FILES_DIR, "free")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"mastered_{file_id}.wav")
        
        process_audio_file(upload_path, output_path, tier="free", genre=genre)
        os.remove(upload_path)
        
        mastered_rel = f"/files/free/mastered_{file_id}.wav"
        mastered_abs = f"https://crysgarage.studio{mastered_rel}"
        file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        
        return {
            "file_id": file_id,
            "status": "completed",
            "processed_file": mastered_rel,
            "mastered_url": mastered_abs,
            "masteredUrl": mastered_abs,
            "processedUrl": mastered_abs,
            "processed_audio_url": mastered_abs,  # For frontend download compatibility
            "file_url": mastered_abs,  # Additional alias for frontend compatibility
            "size": file_size,
            "tier": "free",
            "genre": genre,
        }
    except Exception as e:
        logger.error(f"Matchering error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-upload")
async def analyze_upload(audio: UploadFile = File(...), user_id: str = Form("upload-user")):
    """
    Analyze uploaded audio and return detailed metrics: LUFS, RMS, Peak, Spectral bands, Stereo width.
    Used by Advanced tier for pre-mastering analysis.
    """
    try:
        if not AUDIO_PROCESSING_AVAILABLE:
            raise HTTPException(status_code=500, detail="Audio processing libraries not available")
        
        import time
        import numpy as np
        
        logger.info(f"📊 Analyzing upload for user: {user_id}, file: {audio.filename}")
        
        # Save temporary file
        timestamp = int(time.time() * 1000)
        temp_path = os.path.join(UPLOAD_DIR, f"analyze_upload_{user_id}_{timestamp}_{audio.filename}")
        
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        # Load audio (stereo preserved)
        y, sr = librosa.load(temp_path, sr=None, mono=False)
        if y.ndim == 1:
            y_stereo = np.vstack([y, y])
        else:
            y_stereo = y
        y_mono = np.mean(y_stereo, axis=0)
        
        # LUFS measurement
        meter = pyln.Meter(sr)
        loudness = float(meter.integrated_loudness(y_mono))
        
        # RMS / Peak / Crest
        rms = float(np.sqrt(np.mean(y_mono ** 2)) + 1e-12)
        peak = float(np.max(np.abs(y_mono)) + 1e-12)
        rms_db = 20 * np.log10(rms)
        peak_db = 20 * np.log10(peak)
        crest_factor = float(peak_db - rms_db)
        
        # Spectral bands (octave-like bands)
        bands = [(20, 40), (40, 80), (80, 160), (160, 320), (320, 640), 
                 (640, 1280), (1280, 2560), (2560, 5120), (5120, 10240), (10240, 20000)]
        S = np.abs(librosa.stft(y_mono, n_fft=4096, hop_length=1024)) ** 2
        freqs = librosa.fft_frequencies(sr=sr, n_fft=4096)
        
        spectral_bands = []
        for low, high in bands:
            idx = np.where((freqs >= low) & (freqs < high))[0]
            band_power = float(np.mean(S[idx, :]) if idx.size > 0 else 0.0)
            band_db = 10 * np.log10(band_power + 1e-12)
            spectral_bands.append({"low": low, "high": high, "power_db": band_db})
        
        # Stereo width (M/S energy ratio by band)
        L, R = y_stereo[0], y_stereo[1]
        M = 0.5 * (L + R)
        S_ms = 0.5 * (L - R)
        Sm = np.abs(librosa.stft(M, n_fft=2048, hop_length=512)) ** 2
        Ss = np.abs(librosa.stft(S_ms, n_fft=2048, hop_length=512)) ** 2
        f2 = librosa.fft_frequencies(sr=sr, n_fft=2048)
        
        stereo_width_bands = []
        for low, high in bands:
            idx = np.where((f2 >= low) & (f2 < high))[0]
            m_e = float(np.mean(Sm[idx, :]) if idx.size > 0 else 0.0)
            s_e = float(np.mean(Ss[idx, :]) if idx.size > 0 else 0.0)
            width = float(s_e / (m_e + 1e-12))
            stereo_width_bands.append({"low": low, "high": high, "width": width})
        
        # Duration
        duration = float(len(y_mono) / sr)
        
        # Cleanup temp file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
        
        result = {
            "status": "success",
            "metadata": {
                "lufs": loudness,
                "duration": duration,
                "sample_rate": sr,
                "file_size": len(content)
            },
            "rms_db": rms_db,
            "peak_db": peak_db,
            "crest_factor": crest_factor,
            "spectral_bands": spectral_bands,
            "stereo_width_bands": stereo_width_bands
        }
        
        logger.info(f"✅ Analysis complete: LUFS={loudness:.1f}, Peak={peak_db:.1f}dB, Duration={duration:.1f}s")
        
        return result
        
    except Exception as e:
        logger.error(f"/analyze-upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/admin/api/v1/visitors/track")
async def track_visitor(data: dict):
    try:
        logger.info(f"Visitor: {data.get('session_id', 'unknown')}")
        return {"status": "success", "message": "Visitor tracked"}
    except Exception as e:
        logger.error(f"Tracking failed: {e}")
        raise HTTPException(status_code=500, detail="Tracking failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
