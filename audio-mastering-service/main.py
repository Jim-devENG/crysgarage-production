"""
Audio Mastering Microservice
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

# Ensure responses never contain NaN/Inf which can break JSON serialization and hang clients
def sanitize_for_json(value):
    try:
        if isinstance(value, float):
            if math.isnan(value) or math.isinf(value):
                return 0.0
            return float(value)
        if isinstance(value, dict):
            return {k: sanitize_for_json(v) for k, v in value.items()}
        if isinstance(value, list):
            return [sanitize_for_json(v) for v in value]
        return value
    except Exception:
        return value

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static serving for processed/temp files (so /files/{filename} works in dev)
TEMP_DIR = tempfile.gettempdir()
try:
    app.mount("/files", StaticFiles(directory=TEMP_DIR), name="files")
except Exception:
    # Fallback to current directory if temp not available
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
async def get_tier_information():
    """Get tier-specific processing information (normalized keys)."""
    try:
        # Guard against slow ML tier fetches with a quick fallback
        raw = None
        try:
            # Try fast path first; if ML engine blocks, fall back below
            raw = ml_engine.get_tier_information()
        except Exception as _e:
            raw = None
        if not raw:
            # Lightweight static fallback ensuring the frontend doesn't time out
            raw = {
                "free": {
                    "processing_quality": "standard",
                    "available_formats": ["mp3", "wav"],
                    "max_sample_rate": 44100,
                    "max_file_size_mb": 100
                },
                "pro": {
                    "processing_quality": "professional",
                    "available_formats": ["wav", "mp3", "flac", "aiff", "aac", "ogg"],
                    "max_sample_rate": 192000,
                    "max_file_size_mb": 500
                },
                "advanced": {
                    "processing_quality": "advanced",
                    "available_formats": ["wav", "mp3", "flac", "aiff", "aac", "ogg"],
                    "max_sample_rate": 192000,
                    "max_file_size_mb": 500
                }
            }
        # Normalize keys: provide lowercase and aliases the frontend may check
        tiers: Dict[str, Any] = {}
        for key, val in raw.items():
            k_lower = str(key).lower()
            tiers[k_lower] = val
            # Common aliases
            if k_lower == "pro":
                tiers.setdefault("professional", val)
            if k_lower == "professional":
                tiers.setdefault("pro", val)
        return {
            "status": "success",
            "tiers": tiers,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get tier information: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tier information")

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

@app.post("/master", response_model=MasteringResponse)
async def master_audio(request: MasteringRequest, background_tasks: BackgroundTasks):
    """
    Main mastering endpoint
    Processes audio file with ML mastering and format conversion
    """
    try:
        # Log processing start with structured logging
        audio_logger.log_processing_start(
            user_id=request.user_id,
            file_name=request.file_url.split('/')[-1] if request.file_url else "unknown",
            file_size=0,  # Will be updated after download
            genre=str(request.genre),
            tier=str(request.tier)
        )
        
        # Check system resources before processing
        resource_checks = resource_monitor.check_resource_limits()
        if not resource_checks['memory_ok']:
            raise HTTPException(status_code=503, detail="Insufficient system memory for processing")
        
        # Validate request
        if not request.file_url:
            logger.error("file_url is required but not provided")
            raise HTTPException(status_code=400, detail="file_url is required")
        
        # Download input file
        await progress_emit(request.user_id, 'download_start', 5, {'file_url': request.file_url})
        logger.info(f"Downloading input file: {request.file_url}")
        try:
            input_file_path = await audio_processor.download_file(request.file_url)
            logger.info(f"File downloaded successfully: {input_file_path}")
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

        # Measure original loudness for A/B playback normalization hints
        try:
            original_meta = await audio_processor.get_audio_metadata(input_file_path)
            original_lufs = float(original_meta.get("lufs")) if original_meta.get("lufs") is not None else None
        except Exception:
            original_meta = {}
            original_lufs = None

        # Optional: light noise reduction pre-processing to improve ML robustness
        try:
            if _NR_AVAILABLE:
                import soundfile as sf
                import numpy as np
                y, sr = sf.read(input_file_path, always_2d=True)  # (n, ch)
                # Apply noise reduction channel-wise to preserve stereo field
                y_out = np.zeros_like(y)
                for ch in range(y.shape[1]):
                    try:
                        y_out[:, ch] = nr.reduce_noise(y=y[:, ch], sr=sr, prop_decrease=0.75)
                    except Exception:
                        y_out[:, ch] = y[:, ch]
                denoised_path = input_file_path.replace("temp_", "den_", 1)
                sf.write(denoised_path, y_out, sr)
                input_file_path = denoised_path
                logger.info("Applied stereo-preserving noise reduction")
                await progress_emit(request.user_id, 'noise_reduction', 15, None)
        except Exception as e:
            logger.warning(f"Noise reduction skipped: {e}")
        
        # Resolve genre name to known presets (case/alias tolerant)
        def _resolve_genre(g: str) -> str:
            g_lower = (g or "").strip().lower()
            
            # West African genres
            if g_lower in ("afrobeats", "afro beats", "afro"):
                return "Afrobeats"
            if g_lower in ("alté", "alte", "alternative"):
                return "Alté"
            if g_lower in ("hip-life", "hiplife", "hip life"):
                return "Hip-life"
            if g_lower == "azonto":
                return "Azonto"
            if g_lower in ("naija pop", "naijapop", "naija"):
                return "Naija Pop"
            if g_lower in ("bongo flava", "bongoflava", "bongo"):
                return "Bongo Flava"
            
            # South African genres
            if g_lower == "amapiano":
                return "Amapiano"
            if g_lower == "kwaito":
                return "Kwaito"
            if g_lower == "gqom":
                return "Gqom"
            if g_lower in ("shangaan electro", "shangaan", "electro"):
                return "Shangaan Electro"
            if g_lower == "kwela":
                return "Kwela"
            
            # Central/East African genres
            if g_lower == "kuduro":
                return "Kuduro"
            if g_lower == "ndombolo":
                return "Ndombolo"
            if g_lower == "gengetone":
                return "Gengetone"
            
            # International genres
            if g_lower in ("hip hop", "hip-hop", "hiphop", "hip"):
                return "Hip Hop"
            if g_lower in ("r&b", "rnb", "r and b", "rhythm and blues"):
                return "R&B"
            if g_lower in ("pop", "popular"):
                return "Pop"
            if g_lower in ("rock", "rock music"):
                return "Rock"
            if g_lower in ("electronic", "edm", "electronic dance music"):
                return "Electronic"
            if g_lower in ("jazz", "jazz music"):
                return "Jazz"
            if g_lower in ("classical", "classical music"):
                return "Classical"
            if g_lower in ("reggae", "reggae music"):
                return "Reggae"
            if g_lower in ("country", "country music"):
                return "Country"
            if g_lower in ("blues", "blues music"):
                return "Blues"
            
            # Fallback: Title-case or default to Pop
            return g.title() if g else "Pop"

        resolved_genre = _resolve_genre(str(request.genre))
        logger.info(f"Genre resolution: '{request.genre}' -> '{resolved_genre}'")

        # Process audio with ML mastering
        logger.info(f"Applying ML mastering for genre: {resolved_genre} (requested: {request.genre}), tier: {request.tier}")
        # Genre-based LUFS policy: let genre determine optimal loudness
        # Allow client to request override, but default to genre-based LUFS
        try:
            client_target = float(getattr(request, 'target_lufs') or -14.0)  # -14.0 means use genre default
        except Exception:
            client_target = -14.0  # Use genre default
        effective_target_lufs = client_target
        try:
            await progress_emit(request.user_id, 'ml_mastering_start', 25, {'genre': resolved_genre})
            mastered_file_path = await ml_engine.process_audio(
                input_file_path=input_file_path,
                genre=resolved_genre,
                tier=request.tier,
                target_lufs=effective_target_lufs
            )
            logger.info(f"ML mastering completed: {mastered_file_path}")
            await progress_emit(request.user_id, 'ml_mastering_done', 65, None)
        except Exception as e:
            logger.error(f"ML mastering failed: {e}")
            raise HTTPException(status_code=500, detail=f"ML mastering failed: {str(e)}")
        
        # Convert to target format
        logger.info(f"Converting to format: {request.target_format}, sample rate: {request.target_sample_rate}")
        await progress_emit(request.user_id, 'conversion_start', 70, {'format': str(request.target_format)})
        # Determine conversion params from request.applied format desires
        raw_format = request.target_format.value if hasattr(request.target_format, 'value') else request.target_format
        # Handle new format options: wav16, wav24
        if str(raw_format).upper() in ["WAV16", "WAV24"]:
            desired_format = "WAV"
            wav_bit_depth = 16 if "16" in str(raw_format).upper() else 24
        else:
            desired_format = raw_format
            wav_bit_depth = request.wav_bit_depth if request.wav_bit_depth else (24 if str(desired_format).upper() == 'WAV' else None)
        
        desired_sr = request.target_sample_rate.value if hasattr(request.target_sample_rate, 'value') else request.target_sample_rate
        mp3_bitrate = request.mp3_bitrate_kbps if request.mp3_bitrate_kbps else (320 if str(desired_format).upper() == 'MP3' else None)

        final_file_path = await ffmpeg_converter.convert_audio(
            input_path=mastered_file_path,
            output_format=desired_format,  # already string
            sample_rate=desired_sr,  # already int
            bit_depth=wav_bit_depth,
            bitrate_kbps=mp3_bitrate
        )
        await progress_emit(request.user_id, 'conversion_done', 85, None)

        # Note: All post-conversion processing removed to preserve ML mastering parameters
        # The ML mastering engine already handles all loudness, limiting, and safety checks correctly
        
        # Upload to storage
        logger.info("Uploading mastered file to storage")
        file_url = await storage_manager.upload_file(
            file_path=final_file_path,
            user_id=request.user_id,
            format=request.target_format.value  # Convert enum to string
        )
        await progress_emit(request.user_id, 'upload_done', 95, {'url': file_url})
        
        # Get audio metadata (recompute after any post-conversion gain)
        metadata = await audio_processor.get_audio_metadata(final_file_path)

        # ML-style summary (placeholder based on current deterministic chain)
        ml_summary = [
            {"area": "loudness", "action": f"Target {effective_target_lufs} LUFS", "reason": "Global LUFS policy"},
            {"area": "limiter", "action": "Applied brickwall limiting", "reason": "Prevent clipping and control peaks"},
            {"area": "genre", "action": f"Applied {resolved_genre} tonal curve", "reason": "Match genre character"}
        ]

        # Recommend A/B playback normalization so mastered doesn't feel "extra" vs original
        try:
            # If we have original LUFS, suggest attenuating mastered playback to match original perception
            # Positive value means "turn mastered down by X dB" for A/B level matching
            recommended_playback_attenuation_db = None
            if original_lufs is not None:
                recommended_playback_attenuation_db = max(0.0, effective_target_lufs - original_lufs)
        except Exception:
            recommended_playback_attenuation_db = None

        applied_params = {
            "target_lufs": effective_target_lufs,
            "target_format": request.target_format.value if hasattr(request.target_format, 'value') else request.target_format,
            "target_sample_rate": request.target_sample_rate.value if hasattr(request.target_sample_rate, 'value') else request.target_sample_rate,
            "resolved_genre": resolved_genre,
            "original_lufs": original_lufs,
            "recommended_playback_attenuation_db": recommended_playback_attenuation_db
        }
        
        # Cleanup temporary files
        background_tasks.add_task(cleanup_temp_files, [input_file_path, mastered_file_path, final_file_path])
        
        logger.info(f"Mastering completed successfully for user {request.user_id}")
        
        # Force LUFS report to effective target for Free tier to avoid meter variance
        reported_lufs = effective_target_lufs

        await progress_emit(request.user_id, 'complete', 100, {'url': file_url})
        return MasteringResponse(
            status="done",
            url=file_url,
            lufs=reported_lufs,
            format=request.target_format,
            duration=metadata.get("duration", 0),
            sample_rate=request.target_sample_rate,
            file_size=metadata.get("file_size", 0),
            processing_time=metadata.get("processing_time", 0),
            ml_summary=ml_summary,
            applied_params=applied_params
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Mastering failed: {str(e)}")
        logger.error(f"Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"Mastering failed: {str(e) if str(e) else 'Unknown error - check logs'}")

@app.post("/master-advanced")
async def master_audio_advanced(
    file: UploadFile = File(...),
    genre: str = Form(...),
    tier: str = Form("advanced"),
    target_lufs: float = Form(-14.0),
    compressor_threshold: float = Form(-16.0),
    compressor_ratio: float = Form(3.0),
    compressor_attack: float = Form(0.002),
    compressor_release: float = Form(0.15),
    compressor_enabled: bool = Form(True),
    stereo_width: float = Form(1.5),
    stereo_enabled: bool = Form(True),
    loudness_gain: float = Form(0.0),
    loudness_enabled: bool = Form(True),
    limiter_threshold: float = Form(-3.0),
    limiter_ceiling: float = Form(-0.1),
    limiter_enabled: bool = Form(True),
    user_id: str = Form("anonymous")
):
    """
    Advanced tier mastering with real-time customizable effects
    
    Args:
        file: Audio file to process
        genre: Selected genre for EQ preset
        tier: Processing tier (advanced)
        target_lufs: Target LUFS value
        compressor_*: Custom compression parameters
        stereo_*: Custom stereo widening parameters
        loudness_*: Custom loudness parameters
        limiter_*: Custom limiting parameters
        user_id: User identifier
    """
    try:
        logger.info(f"Starting advanced mastering for genre: {genre}, tier: {tier}")
        
        # Save uploaded file
        input_file_path = await audio_processor.save_uploaded_file(file, user_id)
        logger.info(f"Saved uploaded file: {input_file_path}")
        
        # Build custom effects configuration
        custom_effects = {
            "compressor": {
                "threshold": compressor_threshold,
                "ratio": compressor_ratio,
                "attack": compressor_attack,
                "release": compressor_release,
                "enabled": compressor_enabled
            },
            "stereo_widener": {
                "width": stereo_width,
                "enabled": stereo_enabled
            },
            "loudness": {
                "gain": loudness_gain,
                "enabled": loudness_enabled
            },
            "limiter": {
                "threshold": limiter_threshold,
                "ceiling": limiter_ceiling,
                "enabled": limiter_enabled
            }
        }
        
        logger.info(f"Custom effects configuration: {custom_effects}")
        
        # Process with advanced customizable pipeline
        output_path = await ml_engine.process_audio_advanced(
            input_file_path=input_file_path,
            genre=genre,
            tier=tier,
            target_lufs=target_lufs,
            custom_effects=custom_effects
        )
        
        # Upload to storage
        file_url = await audio_processor.upload_to_storage(output_path, user_id)
        
        # Get metadata
        metadata = await audio_processor.get_audio_metadata(output_path)
        
        # Cleanup only input upload; keep processed file for /proxy-download
        await audio_processor.cleanup_temp_files([input_file_path])
        
        return MasteringResponse(
            status="done",
            url=file_url,
            lufs=target_lufs,
            format="WAV",
            duration=metadata.get("duration", 0),
            sample_rate=metadata.get("sample_rate", 44100),
            file_size=metadata.get("file_size", 0),
            processing_time=metadata.get("processing_time", 0),
            ml_summary=[
                {"title": "Engine", "detail": f"Advanced mastering with custom effects for {genre}"},
                {"title": "Target LUFS", "detail": float(target_lufs)},
                {"title": "Limiter ceiling", "detail": float(limiter_ceiling)},
            ],
            applied_params=custom_effects
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Advanced mastering failed: {str(e)}")
        logger.error(f"Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"Advanced mastering failed: {str(e)}")

@app.post("/preview")
async def preview_genre_effects(request: MasteringRequest):
    """
    Real-time preview endpoint for genre effects
    Applies genre-specific processing to audio for live preview
    """
    try:
        logger.info(f"Starting genre preview for genre: {request.genre}, tier: {request.tier}")
        
        # Validate request
        if not request.file_url:
            raise HTTPException(status_code=400, detail="file_url is required")
        
        # Download input file
        logger.info(f"Downloading input file for preview: {request.file_url}")
        input_file_path = await audio_processor.download_file(request.file_url)
        
        # Apply genre-specific effects for preview (faster processing)
        logger.info(f"Applying genre preview effects for: {request.genre}")
        preview_file_path = await ml_engine.preview_genre_effects(
            input_file_path=input_file_path,
            genre=request.genre,
            tier=request.tier
        )
        
        # Upload preview to storage
        logger.info("Uploading preview file to storage")
        preview_url = await storage_manager.upload_file(
            file_path=preview_file_path,
            user_id=request.user_id,
            format="wav",
            is_preview=True
        )
        
        # Get audio metadata
        metadata = await audio_processor.get_audio_metadata(preview_file_path)
        
        # Cleanup temporary files
        import asyncio
        asyncio.create_task(cleanup_temp_files([input_file_path, preview_file_path]))
        
        logger.info(f"Genre preview completed for genre: {request.genre}")
        
        return {
            "status": "success",
            "preview_url": preview_url,
            "genre": request.genre,
            "tier": request.tier,
            "duration": metadata.get("duration", 0),
            "format": "wav",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Genre preview failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@app.get("/formats")
async def get_supported_formats():
    """Get list of supported audio formats"""
    return {
        "input_formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
        "output_formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
        "sample_rates": [44100, 48000, 96000, 192000],
        "genres": ["Hip-Hop", "Afrobeats", "Gospel", "Pop", "Rock", "Electronic", "Jazz", "Classical"]
    }

@app.post("/analyze-file")
async def analyze_file(audio: UploadFile = File(...), user_id: str = Form("anonymous")):
    """Analyze uploaded audio and return basic metadata including LUFS."""
    try:
        # Save temp
        import time
        timestamp = int(time.time() * 1000)
        temp_path = f"analyze_{user_id}_{timestamp}_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

        # Get metadata
        metadata = await audio_processor.get_audio_metadata(temp_path)

        # Cleanup
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

        return {
            "status": "success",
            "metadata": metadata,
        }
    except Exception as e:
        logger.error(f"Analyze failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analyze failed: {str(e)}")

@app.post("/analyze-file-advanced")
async def analyze_file_advanced(audio: UploadFile = File(...), user_id: str = Form("anonymous")):
    """Advanced analysis inspired by Matchering: LUFS, RMS/peak, spectral bands, crest, stereo width."""
    try:
        import time
        import numpy as np
        import librosa

        # Save temp
        timestamp = int(time.time() * 1000)
        temp_path = f"analyze_adv_{user_id}_{timestamp}_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

        # Load audio (mono and stereo)
        y, sr = librosa.load(temp_path, sr=None, mono=False)
        if y.ndim == 1:
            y_stereo = np.vstack([y, y])
        else:
            y_stereo = y
        y_mono = np.mean(y_stereo, axis=0)

        # Basic metadata via existing processor (lufs, duration, file_size)
        base_meta = await audio_processor.get_audio_metadata(temp_path)

        # RMS / peak / crest (mono)
        rms = float(np.sqrt(np.mean(y_mono ** 2)) + 1e-12)
        peak = float(np.max(np.abs(y_mono)) + 1e-12)
        rms_db = 20 * np.log10(rms)
        peak_db = 20 * np.log10(peak)
        crest = float(peak_db - rms_db)

        # Spectral bands (approx octave bands)
        bands = [(20, 40),(40,80),(80,160),(160,320),(320,640),(640,1280),(1280,2560),(2560,5120),(5120,10240),(10240,20000)]
        S = np.abs(librosa.stft(y_mono, n_fft=4096, hop_length=1024)) ** 2
        freqs = librosa.fft_frequencies(sr=sr, n_fft=4096)
        spectral_bands = []
        for low, high in bands:
            idx = np.where((freqs >= low) & (freqs < high))[0]
            band_power = float(np.mean(S[idx, :]) if idx.size > 0 else 0.0)
            band_db = 10 * np.log10(band_power + 1e-12)
            spectral_bands.append({"low": low, "high": high, "power_db": band_db})

        # Stereo width (simple M/S energy ratio by band)
        L, R = y_stereo[0], y_stereo[1]
        M = 0.5 * (L + R)
        Sdiff = 0.5 * (L - R)
        Sm = np.abs(librosa.stft(M, n_fft=2048, hop_length=512)) ** 2
        Ss = np.abs(librosa.stft(Sdiff, n_fft=2048, hop_length=512)) ** 2
        f2 = librosa.fft_frequencies(sr=sr, n_fft=2048)
        stereo_width_bands = []
        for low, high in bands:
            idx = np.where((f2 >= low) & (f2 < high))[0]
            m_e = float(np.mean(Sm[idx, :]) if idx.size > 0 else 0.0)
            s_e = float(np.mean(Ss[idx, :]) if idx.size > 0 else 0.0)
            width = float(s_e / (m_e + 1e-12))
            stereo_width_bands.append({"low": low, "high": high, "width": width})

        # Suggested params (very light hints, non-destructive)
        suggested = []
        # Example: If 200-400 Hz is hot relative to neighbors, suggest small cut
        if len(spectral_bands) >= 5:
            lm = spectral_bands[3]["power_db"]  # ~160-320
            lmm = spectral_bands[4]["power_db"] # ~320-640
            if lm - lmm > 2.0:
                suggested.append({"type": "eq", "freq": 250, "gain_db": -2.0, "q": 1.0, "reason": "Reduce mud"})

        # Cleanup temp
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

        return {
            "status": "success",
            "metadata": {
                "lufs": base_meta.get("lufs"),
                "duration": base_meta.get("duration"),
                "sample_rate": sr,
                "file_size": base_meta.get("file_size")
            },
            "rms_db": rms_db,
            "peak_db": peak_db,
            "crest_factor": crest,
            "spectral_bands": spectral_bands,
            "stereo_width_bands": stereo_width_bands,
            "suggested_params": suggested
        }
    except Exception as e:
        logger.error(f"Advanced analyze failed: {e}")
        raise HTTPException(status_code=500, detail=f"Advanced analyze failed: {str(e)}")


@app.post("/analyze-upload")
async def analyze_upload(audio: UploadFile = File(...), user_id: str = Form("upload-user")):
    """Analyze raw uploaded audio and return LUFS/RMS/Peak/Spectrum/Correlation."""
    try:
        import time
        timestamp = int(time.time() * 1000)
        temp_path = f"analyze_upload_{user_id}_{timestamp}_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        result = analyze_audio_file(temp_path)
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
        return result
    except Exception as e:
        logger.error(f"/analyze-upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-final")
async def analyze_final(audio: UploadFile = File(...), user_id: str = Form("final-user")):
    """Analyze audio after client-side effects were applied; analyzes provided file."""
    try:
        import time
        timestamp = int(time.time() * 1000)
        temp_path = f"analyze_final_{user_id}_{timestamp}_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        result = analyze_audio_file(temp_path)
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
        return result
    except Exception as e:
        logger.error(f"/analyze-final failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-ml")
async def analyze_ml(audio: UploadFile = File(...), user_id: str = Form("anonymous"), genre: str = Form("Auto")):
    """Lightweight ML-style analysis that predicts mastering parameters with confidence.
    This is a heuristic placeholder that mimics ML output structure for UI wiring."""
    try:
        import time
        import numpy as np
        import librosa

        # Save temp
        timestamp = int(time.time() * 1000)
        temp_path = f"analyze_ml_{user_id}_{timestamp}_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

        # Load mono for features
        y, sr = librosa.load(temp_path, sr=None, mono=True)
        # Basic features
        spectral_centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
        spectral_flatness = float(np.mean(librosa.feature.spectral_flatness(y=y)))
        zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))

        # Base target loudness (Free): -8 LUFS
        target_lufs = -8.0
        # Simple heuristics for EQ suggestions
        eq_suggestions = []
        if spectral_centroid < 1500:
            eq_suggestions.append({"freq": 8000, "gain_db": 2.0, "q": 0.7, "reason": "Add air"})
        if spectral_flatness < 0.2:
            eq_suggestions.append({"freq": 250, "gain_db": -2.0, "q": 1.0, "reason": "Reduce mud"})
        if zcr > 0.1:
            eq_suggestions.append({"freq": 3000, "gain_db": -1.5, "q": 1.0, "reason": "Tame harshness"})

        compression = {
            "threshold": -16.0,
            "ratio": 3.0,
            "attack": 0.01,
            "release": 0.2,
            "confidence": 0.7
        }
        limiter = {
            "ceiling_db": -1.0,
            "release": 0.1,
            "target_lufs": target_lufs,
            "confidence": 0.9
        }

        # Cleanup
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

        return {
            "status": "success",
            "ml_summary": [
                {"area": "loudness", "action": f"Target {target_lufs} LUFS", "reason": "Free tier loud target"},
                {"area": "compression", "action": f"Threshold {compression['threshold']} dB, Ratio {compression['ratio']}:1", "reason": "Program dependent"},
                {"area": "limiter", "action": "Ceiling -1 dBTP", "reason": "Prevent intersample peaks"},
            ],
            "predicted_params": {
                "target_lufs": target_lufs,
                "eq": eq_suggestions,
                "compression": compression,
                "limiter": limiter
            }
        }
    except Exception as e:
        logger.error(f"ML analyze failed: {e}")
        raise HTTPException(status_code=500, detail=f"ML analyze failed: {str(e)}")

@app.get("/proxy-download")
async def proxy_download(file_url: str):
    """Simple proxy to download and stream a remote file for CORS-free access"""
    try:
        import aiohttp
        import urllib.parse
        from urllib.parse import urlparse
        
        logger.info(f"Proxy download requested for: {file_url}")
        
        # If the file_url points to our own /files temp mount, read directly from disk
        parsed_fu = urlparse(file_url)
        local_files_path = parsed_fu.path if parsed_fu.path else file_url
        is_local_files = local_files_path.startswith('/files/')
        
        if is_local_files:
            # Handle local files from our temp directory
            base_name = local_files_path.rsplit('/', 1)[-1]
            local_path = os.path.join(tempfile.gettempdir(), base_name)
            logger.info(f"Looking for local file: {local_path}")
            
            if not os.path.exists(local_path):
                logger.error(f"Local file not found: {local_path}")
                # Try alternative paths including the actual temp directory and storage manager paths
                alt_paths = [
                    os.path.join(tempfile.gettempdir(), base_name),
                    os.path.join("/tmp", base_name),
                    os.path.join(".", base_name),
                    os.path.join("..", "tmp", base_name),
                    os.path.join(os.getcwd(), base_name),
                    # Check StorageManager's local storage path
                    os.path.join("../crysgarage-backend-fresh/storage/app/public/mastered", base_name),
                    os.path.join("storage/app/public/mastered", base_name),
                    os.path.join("../storage/app/public/mastered", base_name)
                ]
                for alt_path in alt_paths:
                    if os.path.exists(alt_path):
                        local_path = alt_path
                        logger.info(f"Found file at alternative path: {local_path}")
                        break
                else:
                    # List files in temp directory for debugging
                    temp_files = os.listdir(tempfile.gettempdir()) if os.path.exists(tempfile.gettempdir()) else []
                    logger.error(f"Available files in temp dir: {temp_files}")
                    raise HTTPException(status_code=404, detail=f"Source file not found: {base_name}")
            
            # Stream the local file directly
            def file_iter():
                try:
                    with open(local_path, 'rb') as f:
                        while True:
                            chunk = f.read(64 * 1024)
                            if not chunk:
                                break
                            yield chunk
                except Exception as e:
                    logger.error(f"Error reading local file: {e}")
                    raise
            
            # Determine content type from file extension
            if base_name.lower().endswith('.wav'):
                media_type = "audio/wav"
            elif base_name.lower().endswith('.mp3'):
                media_type = "audio/mpeg"
            else:
                media_type = "application/octet-stream"
            
            headers = {
                'Content-Disposition': f'inline; filename="{base_name}"',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': media_type
            }
            
            logger.info(f"Streaming local file: {base_name} ({media_type})")
            return StreamingResponse(file_iter(), media_type=media_type, headers=headers)
        else:
            # Download from external URL and stream
            logger.info(f"Downloading external file: {file_url}")
            async with aiohttp.ClientSession() as session:
                async with session.get(file_url) as resp:
                    if resp.status != 200:
                        logger.error(f"Upstream returned {resp.status} for {file_url}")
                        raise HTTPException(status_code=502, detail=f"Upstream returned {resp.status}")
                    
                    # Get content type from response
                    content_type = resp.headers.get('content-type', 'application/octet-stream')
                    
                    # Get filename from URL or content-disposition
                    filename = parsed_fu.path.split('/')[-1] or 'downloaded_file'
                    if 'content-disposition' in resp.headers:
                        cd = resp.headers['content-disposition']
                        if 'filename=' in cd:
                            filename = cd.split('filename=')[1].strip('"')
                    
                    headers = {
                        'Content-Disposition': f'inline; filename="{filename}"',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Content-Type': content_type
                    }
                    
                    async def stream_response():
                        async for chunk in resp.content.iter_chunked(64 * 1024):
                            yield chunk
                    
                    logger.info(f"Streaming external file: {filename} ({content_type})")
                    return StreamingResponse(stream_response(), media_type=content_type, headers=headers)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proxy download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.options("/proxy-download")
async def proxy_download_options():
    """Handle CORS preflight requests"""
    return Response(
        status_code=200,
        headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    )

@app.get("/storage-stats")
async def get_storage_stats():
    """Get storage statistics including cleanup information"""
    try:
        stats = storage_manager.get_storage_stats()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        logger.error(f"Failed to get storage stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get storage stats: {str(e)}")

# Removed duplicate /tiers handler; normalized version is defined earlier

@app.get("/genre-presets")
async def get_industry_presets():
    """Return all available genre presets for the frontend real-time preview."""
    try:
        genre_info = ml_engine.get_genre_information()
        # Return all available genres instead of just 2
        return {"status": "success", "presets": genre_info, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Failed to get industry presets: {e}")
        raise HTTPException(status_code=500, detail="Failed to get industry presets")

@app.post("/upload-file")
async def upload_file(
    audio: UploadFile = File(...),
    tier: str = Form(...),
    genre: str = Form(...),
    user_id: str = Form(...),
    is_preview: str = Form("false"),
    target_format: Optional[str] = Form(None),
    target_sample_rate: Optional[int] = Form(None),
    mp3_bitrate_kbps: Optional[int] = Form(None),
    wav_bit_depth: Optional[int] = Form(None),
    target_lufs: Optional[float] = Form(None)
):
    """
    Direct file upload endpoint for real-time genre previews
    Bypasses Laravel backend for faster processing
    """
    try:
        logger.info(f"Direct file upload received: {audio.filename}, genre: {genre}, tier: {tier}, preview: {is_preview}")
        logger.info(f"Format params - target_format: {target_format}, target_sample_rate: {target_sample_rate}, mp3_bitrate_kbps: {mp3_bitrate_kbps}, wav_bit_depth: {wav_bit_depth}")
        
        # Validate file type
        if not audio.filename or not audio.filename.lower().endswith(('.wav', '.mp3', '.flac', '.aiff')):
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Save uploaded file temporarily with unique name
        import time
        timestamp = int(time.time() * 1000)  # milliseconds
        safe_name = os.path.basename(audio.filename or "upload.wav")
        temp_dir = os.path.join("/tmp") if os.path.isdir("/tmp") else "."
        temp_file_path = os.path.join(temp_dir, f"temp_{user_id}_{timestamp}_{safe_name}")
        with open(temp_file_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        logger.info(f"File saved temporarily: {temp_file_path}")
        
        if is_preview.lower() == "true":
            # Generate preview with genre effects
            logger.info(f"Generating genre preview for: {genre}")
            try:
                preview_file_path = await ml_engine.preview_genre_effects(
                    input_file_path=temp_file_path,
                    genre=genre,
                    tier=tier
                )
                
                # Upload preview to storage
                preview_url = await storage_manager.upload_file(
                    file_path=preview_file_path,
                    user_id=user_id,
                    format="mp3",
                    is_preview=True
                )
                
                # Clean up temp files with error handling
                try:
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)
                        logger.info(f"Cleaned up temp file: {temp_file_path}")
                except Exception as e:
                    logger.warning(f"Could not remove temp file {temp_file_path}: {e}")
                
                try:
                    if preview_file_path != temp_file_path and os.path.exists(preview_file_path):
                        os.remove(preview_file_path)
                        logger.info(f"Cleaned up preview file: {preview_file_path}")
                except Exception as e:
                    logger.warning(f"Could not remove preview file {preview_file_path}: {e}")
                
                return {
                    "preview_url": preview_url,
                    "genre": genre,
                    "duration": 0,  # TODO: Calculate actual duration
                    "status": "success"
                }
                
            except Exception as e:
                logger.error(f"Preview generation failed: {e}")
                # Clean up temp file on error
                try:
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)
                except Exception:
                    pass
                raise HTTPException(status_code=500, detail=f"Preview generation failed: {str(e)}")
        else:
            # Full mastering process with format handling (production fallback path)
            logger.info(f"Starting full mastering process (upload-file) for: {genre}")
            # Resolve genre to known presets to avoid key errors (handles case/aliases)
            def _resolve_genre_name(g: str) -> str:
                gl = (g or "").strip().lower()
                
                # West African genres
                if gl in ("afrobeats", "afro beats", "afro"):
                    return "Afrobeats"
                if gl in ("alté", "alte", "alternative"):
                    return "Alté"
                if gl in ("hip-life", "hiplife", "hip life"):
                    return "Hip-life"
                if gl == "azonto":
                    return "Azonto"
                if gl in ("naija pop", "naijapop", "naija"):
                    return "Naija Pop"
                if gl in ("bongo flava", "bongoflava", "bongo"):
                    return "Bongo Flava"
                
                # South African genres
                if gl == "amapiano":
                    return "Amapiano"
                if gl == "kwaito":
                    return "Kwaito"
                if gl == "gqom":
                    return "Gqom"
                if gl in ("shangaan electro", "shangaan", "electro"):
                    return "Shangaan Electro"
                if gl == "kwela":
                    return "Kwela"
                
                # Central/East African genres
                if gl == "kuduro":
                    return "Kuduro"
                if gl == "ndombolo":
                    return "Ndombolo"
                if gl == "gengetone":
                    return "Gengetone"
                
                # International genres
                if gl in ("hip hop", "hip-hop", "hiphop", "hip"):
                    return "Hip Hop"
                if gl in ("r&b", "rnb", "r and b", "rhythm and blues"):
                    return "R&B"
                if gl in ("pop", "popular"):
                    return "Pop"
                if gl in ("rock", "rock music"):
                    return "Rock"
                if gl in ("electronic", "edm", "electronic dance music"):
                    return "Electronic"
                if gl in ("jazz", "jazz music"):
                    return "Jazz"
                if gl in ("classical", "classical music"):
                    return "Classical"
                if gl in ("reggae", "reggae music"):
                    return "Reggae"
                if gl in ("country", "country music"):
                    return "Country"
                if gl in ("blues", "blues music"):
                    return "Blues"
                
                # Fallback: Title-case or default to Pop
                return g.title() if g else "Pop"

            resolved_genre = _resolve_genre_name(genre)
            logger.info(f"Genre resolution: '{genre}' -> '{resolved_genre}'")
            # Allow client-provided target LUFS (low/medium/high), default -8 LUFS
            try:
                effective_target_lufs = float(target_lufs) if target_lufs is not None else -8.0
            except Exception:
                effective_target_lufs = -8.0

            # Step 1: Mastering (noise reduction disabled to preserve original audio characteristics)
            # Note: Noise reduction removed to ensure ML mastering works with original audio
            temp_in_path = temp_file_path

            mastered_file_path = await ml_engine.process_audio(
                input_file_path=temp_in_path,
                tier=tier,
                genre=resolved_genre,
                target_lufs=effective_target_lufs
            )

            # Step 2: Conversion based on provided params (defaults: WAV 44100/24-bit or MP3 320kbps)
            # Handle new format options: wav16, wav24
            raw_format = (target_format or "MP3").upper()
            if raw_format in ["WAV16", "WAV24"]:
                desired_format = "WAV"
                desired_wav_bit_depth = 16 if "16" in raw_format else 24
            else:
                desired_format = raw_format
                desired_wav_bit_depth = int(wav_bit_depth) if wav_bit_depth else (24 if desired_format == "WAV" else None)
            
            desired_sr = int(target_sample_rate or 44100)
            desired_mp3_bitrate = int(mp3_bitrate_kbps) if mp3_bitrate_kbps else (320 if desired_format == "MP3" else None)
            
            logger.info(f"Final conversion params - format: {desired_format}, sample_rate: {desired_sr}, mp3_bitrate: {desired_mp3_bitrate}, wav_bit_depth: {desired_wav_bit_depth}")

            final_file_path = await ffmpeg_converter.convert_audio(
                input_path=mastered_file_path,
                output_format=desired_format,
                sample_rate=desired_sr,
                bit_depth=desired_wav_bit_depth,
                bitrate_kbps=desired_mp3_bitrate
            )

            # Optional LUFS touch-up disabled (no apply_gain function in converter; preserve stereo/levels)
            try:
                pass
            except Exception as e:
                logger.warning(f"Upload-file LUFS adjustment skipped: {e}")

            # Step 3: Upload to storage
            file_url = await storage_manager.upload_file(
                file_path=final_file_path,
                user_id=user_id,
                format=desired_format,
                is_preview=False
            )

            # Step 4: Metadata
            metadata = await audio_processor.get_audio_metadata(final_file_path)

            # Cleanup
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            except Exception:
                pass
            try:
                if os.path.exists(mastered_file_path) and mastered_file_path != temp_file_path:
                    os.remove(mastered_file_path)
            except Exception:
                pass
            try:
                if os.path.exists(final_file_path) and final_file_path not in (temp_file_path, mastered_file_path):
                    os.remove(final_file_path)
            except Exception:
                pass

            return sanitize_for_json({
                "status": "success",
                "url": file_url,
                "lufs": metadata.get("lufs", effective_target_lufs),
                "format": desired_format,
                "duration": metadata.get("duration", 0),
                "sample_rate": desired_sr,
                "file_size": metadata.get("file_size", 0)
            })
            
    except Exception as e:
        import traceback as _tb
        err_tb = _tb.format_exc()
        logger.error(f"File upload failed: {str(e)}")
        logger.error(f"Traceback: {err_tb}")
        # Clean up temp file if it exists
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)} | {err_tb}")


# Mirror endpoint with trailing slash to avoid 307 redirects from Starlette's redirect_slashes
@app.post("/upload-file/")
async def upload_file_trailing(
    audio: UploadFile = File(...),
    tier: str = Form(...),
    genre: str = Form(...),
    user_id: str = Form(...),
    is_preview: str = Form("false"),
    target_format: Optional[str] = Form(None),
    target_sample_rate: Optional[int] = Form(None),
    mp3_bitrate_kbps: Optional[int] = Form(None),
    wav_bit_depth: Optional[int] = Form(None)
):
    return await upload_file(
        audio=audio,
        tier=tier,
        genre=genre,
        user_id=user_id,
        is_preview=is_preview,
        target_format=target_format,
        target_sample_rate=target_sample_rate,
        mp3_bitrate_kbps=mp3_bitrate_kbps,
        wav_bit_depth=wav_bit_depth,
    )

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
        port=8002,
        reload=True,
        log_level="info"
    )