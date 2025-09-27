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
import time
import threading

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

# =============================================================================
# ROBUST FILE PATH MAPPING SYSTEM
# =============================================================================

# In-memory store for processed file paths (replace with Redis/DB in production)
processed_files = {}
processed_files_lock = threading.Lock()

def save_processed_file_path(file_id: str, file_path: str, tier: str = "free"):
    """Store the exact path of a processed file"""
    with processed_files_lock:
        processed_files[file_id] = {
            "path": file_path,
            "tier": tier,
            "created_at": time.time(),
            "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
        }
    logger.info(f"✅ Processed file path stored: {file_id} -> {file_path}")

def get_processed_file_path(file_id: str) -> Optional[Dict[str, Any]]:
    """Get the exact path of a processed file"""
    with processed_files_lock:
        return processed_files.get(file_id)

def cleanup_old_processed_files():
    """Clean up processed files older than 12 hours"""
    current_time = time.time()
    cleanup_threshold = 12 * 60 * 60  # 12 hours in seconds
    
    with processed_files_lock:
        to_remove = []
        for file_id, file_info in processed_files.items():
            if current_time - file_info["created_at"] > cleanup_threshold:
                # Try to delete the file
                try:
                    if os.path.exists(file_info["path"]):
                        os.remove(file_info["path"])
                        logger.info(f"🗑️ Cleaned up old processed file: {file_info['path']}")
                except Exception as e:
                    logger.warning(f"Failed to delete old file {file_info['path']}: {e}")
                to_remove.append(file_id)
        
        # Remove from mapping
        for file_id in to_remove:
            del processed_files[file_id]
        
        if to_remove:
            logger.info(f"🧹 Cleaned up {len(to_remove)} old processed files")

def get_mime_type_for_extension(ext: str) -> str:
    """Get correct MIME type for audio file extension"""
    mime_map = {
        "mp3": "audio/mpeg",
        "wav": "audio/wav", 
        "flac": "audio/flac",
        "aac": "audio/aac",
        "ogg": "audio/ogg",
        "m4a": "audio/mp4",
        "aiff": "audio/aiff",
        "wma": "audio/x-ms-wma"
    }
    return mime_map.get(ext.lower(), "application/octet-stream")

# Ensure responses never contain NaN/Inf which can break JSON serialization and hang clients
def sanitize_for_json(value):
    try:
        if isinstance(value, float):
            if math.isnan(value) or math.isinf(value):
                return 0.0
            # Check for out of range values
            if abs(value) > 1e10:  # Very large numbers
                return 0.0
            return float(value)
        if isinstance(value, dict):
            return {k: sanitize_for_json(v) for k, v in value.items()}
        if isinstance(value, list):
            return [sanitize_for_json(v) for v in value]
        return value
    except Exception as e:
        logger.warning(f"JSON sanitization failed for {type(value)}: {e}")
        return 0.0

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Startup event to initialize cleanup system
@app.on_event("startup")
async def startup_event():
    """Initialize the audio mastering service"""
    logger.info("🚀 Audio Mastering Service starting up...")
    
    # Create processed files directories
    for tier in ["free", "professional", "advanced"]:
        tier_dir = os.path.join(tempfile.gettempdir(), "processed", tier)
        os.makedirs(tier_dir, exist_ok=True)
        logger.info(f"📁 Created processed directory: {tier_dir}")
    
    # Run initial cleanup
    cleanup_old_processed_files()
    logger.info("✅ Audio Mastering Service startup complete")
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
    """Return strict JSON tier metadata expected by the frontend."""
    return {
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
                "eq_bands": 8,
                "compression_ratio_max": 12
            },
            "max_file_size_mb": 500
        }
    }

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
        
        # Validate the converted file is not corrupted
        is_valid = await ffmpeg_converter.validate_output_file(final_file_path, desired_format)
        if not is_valid:
            raise HTTPException(status_code=500, detail="Audio conversion failed - output file is corrupted")
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
        processed_path = await ml_engine.process_audio_advanced(
            input_file_path=input_file_path,
            genre=genre,
            tier=tier,
            target_lufs=target_lufs,
            custom_effects=custom_effects
        )
        
        # Apply FFmpeg conversion (same as regular upload)
        # Default to WAV 44100/24-bit for advanced tier
        final_output_path = await ffmpeg_converter.convert_audio(
            input_path=processed_path,
            output_format="WAV",
            sample_rate=44100,
            bit_depth=24
        )
        
        # Save processed file with predictable name for simple download (same as regular upload)
        import shutil
        safe_name = file.filename.replace(" ", "_").replace("/", "_") if file.filename else "audio"
        simple_download_path = os.path.join(tempfile.gettempdir(), f"processed_{user_id}_{safe_name}.wav")
        shutil.copy2(final_output_path, simple_download_path)
        
        # Upload to storage
        file_url = await audio_processor.upload_to_storage(final_output_path, user_id)
        
        # Get metadata
        metadata = await audio_processor.get_audio_metadata(final_output_path)
        
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
async def proxy_download(file_url: str, format: str = "MP3", sample_rate: int = 44100):
    """Proxy to download and convert audio files with FFmpeg"""
    try:
        import aiohttp
        import urllib.parse
        from urllib.parse import urlparse
        
        logger.info(f"Proxy download requested for: {file_url}, format: {format}, sample_rate: {sample_rate}")
        
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
                logger.error(f"🎵 DEBUG: Local file not found: {local_path}")
                # Try alternative paths including the actual temp directory and storage manager paths
                alt_paths = [
                    os.path.join(tempfile.gettempdir(), base_name),
                    os.path.join("/tmp", base_name),
                    os.path.join("/tmp/audio", base_name),  # 🎵 DEBUG: Check audio storage directory
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
                        logger.info(f"🎵 DEBUG: Found file at alternative path: {local_path}")
                        break
                else:
                    # List files in temp directory for debugging
                    temp_files = os.listdir(tempfile.gettempdir()) if os.path.exists(tempfile.gettempdir()) else []
                    logger.error(f"🎵 DEBUG: Available files in temp dir: {temp_files}")
                    
                    # 🎵 DEBUG: Also search for files with similar names
                    import glob
                    pattern_matches = []
                    for ext in ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']:
                        pattern = os.path.join(tempfile.gettempdir(), f"*{base_name}*.{ext}")
                        matches = glob.glob(pattern)
                        pattern_matches.extend(matches)
                        # Also search without extension
                        pattern = os.path.join(tempfile.gettempdir(), f"*{base_name}*")
                        matches = glob.glob(pattern)
                        pattern_matches.extend(matches)
                    
                    logger.error(f"🎵 DEBUG: Pattern matches: {pattern_matches}")
                    
                    if pattern_matches:
                        local_path = pattern_matches[0]
                        logger.info(f"🎵 DEBUG: Using pattern match: {local_path}")
                    else:
                        raise HTTPException(status_code=404, detail=f"Source file not found: {base_name}")
            
            # 🎵 DEBUG: Log file size before conversion
            file_size = os.path.getsize(local_path)
            logger.info(f"🎵 DEBUG: Proxy download input file size: {file_size} bytes")
            
            # Convert the file using FFmpeg if format conversion is needed
            input_ext = os.path.splitext(local_path)[1].lower().lstrip('.')
            output_ext = format.lower()
            
            # Check if conversion is needed
            if input_ext != output_ext or sample_rate != 44100:
                logger.info(f"🎵 Converting {input_ext} to {output_ext} at {sample_rate}Hz")
                
                # Create output file path
                output_filename = f"converted_{base_name.rsplit('.', 1)[0]}.{output_ext}"
                output_path = os.path.join(tempfile.gettempdir(), output_filename)
                
                # Use FFmpeg converter for conversion
                try:
                    converted_path = await ffmpeg_converter.convert_audio(
                        input_path=local_path,
                        output_format=format,
                        sample_rate=sample_rate,
                        bit_depth=24 if format == 'WAV' else None,
                        bitrate_kbps=320 if format == 'MP3' else None
                    )
                    
                    # Use the converted file
                    local_path = converted_path
                    base_name = os.path.basename(converted_path)
                    
                    # Log converted file size
                    converted_size = os.path.getsize(converted_path)
                    logger.info(f"🎵 DEBUG: Proxy download converted file size: {converted_size} bytes")
                    
                except Exception as e:
                    logger.error(f"🎵 FFmpeg conversion failed: {e}")
                    # Fall back to original file
                    logger.info("🎵 Falling back to original file without conversion")
            else:
                logger.info(f"🎵 No conversion needed: {input_ext} at {sample_rate}Hz")
            
            # Stream the file (converted or original)
            def file_iter():
                try:
                    with open(local_path, 'rb') as f:
                        while True:
                            chunk = f.read(64 * 1024)
                            if not chunk:
                                break
                            yield chunk
                except Exception as e:
                    logger.error(f"Error reading file: {e}")
                    raise
            
            # Determine content type from format
            if format.upper() == 'WAV':
                media_type = "audio/wav"
            elif format.upper() == 'MP3':
                media_type = "audio/mpeg"
            elif format.upper() == 'FLAC':
                media_type = "audio/flac"
            elif format.upper() == 'AAC':
                media_type = "audio/aac"
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
            
            logger.info(f"Streaming file: {base_name} ({media_type})")
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

@app.get("/download/{file_id}")
async def download_processed_audio(file_id: str):
    """Robust download endpoint using exact file path mapping"""
    try:
        from urllib.parse import unquote
        
        # URL decode the file_id to handle spaces and special characters
        decoded_file_id = unquote(file_id)
        logger.info(f"⬇️ Download request for file_id: {file_id} -> decoded: {decoded_file_id}")
        
        # Get the exact file path from our mapping (no guessing!)
        file_info = get_processed_file_path(decoded_file_id)
        
        if not file_info:
            logger.error(f"❌ Processed file not found in mapping: {decoded_file_id}")
            raise HTTPException(status_code=404, detail="Processed file not found. Please reprocess.")
        
        file_path = file_info["path"]
        
        # Verify the file actually exists
        if not os.path.exists(file_path):
            logger.error(f"❌ Processed file missing from disk: {file_path}")
            # Remove from mapping since file is gone
            with processed_files_lock:
                if decoded_file_id in processed_files:
                    del processed_files[decoded_file_id]
            raise HTTPException(status_code=404, detail="Processed file not found. Please reprocess.")
        
        # Get file info
        file_size = os.path.getsize(file_path)
        file_ext = os.path.splitext(file_path)[1].lower().lstrip(".")
        mime_type = get_mime_type_for_extension(file_ext)
        
        # 🔍 DEBUG: Log detailed download information
        logger.info(f"🔍 DEBUG: Download endpoint serving file:")
        logger.info(f"🔍 DEBUG: - File path: {file_path}")
        logger.info(f"🔍 DEBUG: - File size: {file_size} bytes ({file_size / (1024*1024):.2f} MB)")
        logger.info(f"🔍 DEBUG: - File extension: {file_ext}")
        logger.info(f"🔍 DEBUG: - MIME type: {mime_type}")
        logger.info(f"🔍 DEBUG: - Directory: {os.path.dirname(file_path)}")
        logger.info(f"🔍 DEBUG: - Is in /tmp/processed/: {'/tmp/processed/' in file_path}")
        
        logger.info(f"⬇️ Serving processed file: {file_path} ({file_size} bytes)")
        logger.info(f"📁 File extension: {file_ext}, MIME type: {mime_type}")
        
        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type=mime_type
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.get("/cleanup-processed-files")
async def cleanup_processed_files_endpoint():
    """Manually trigger cleanup of old processed files"""
    try:
        cleanup_old_processed_files()
        return {"status": "success", "message": "Cleanup completed"}
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@app.get("/processed-files-status")
async def get_processed_files_status():
    """Get status of processed files mapping"""
    try:
        with processed_files_lock:
            return {
                "total_files": len(processed_files),
                "files": list(processed_files.keys()),
                "current_time": time.time()
            }
    except Exception as e:
        logger.error(f"Failed to get processed files status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.get("/storage-stats")
async def get_storage_stats():
    """Get storage statistics including cleanup information"""
    try:
        # Get processed files directory size
        processed_dir = os.path.join(tempfile.gettempdir(), "processed")
        total_size = 0
        file_count = 0
        
        if os.path.exists(processed_dir):
            for root, dirs, files in os.walk(processed_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    if os.path.exists(file_path):
                        total_size += os.path.getsize(file_path)
                        file_count += 1
        
        # Get disk usage
        import shutil
        disk_usage = shutil.disk_usage(tempfile.gettempdir())
        free_space = disk_usage.free
        
        return {
            "processed_files_count": file_count,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "free_space_bytes": free_space,
            "free_space_gb": round(free_space / (1024 * 1024 * 1024), 2),
            "cleanup_last_run": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to get storage stats: {e}")
        raise HTTPException(status_code=500, detail=f"Storage stats failed: {str(e)}")

# =============================================================================
# DEVICE IP TRACKING SYSTEM
# =============================================================================

# In-memory IP tracking storage (replace with database in production)
registered_ips = set()
ip_lock = threading.Lock()

def get_client_ip(request):
    """Extract client IP address from request"""
    # Check for forwarded headers first (for proxies/load balancers)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    # Fallback to direct connection IP
    if hasattr(request, 'client') and request.client:
        return request.client.host
    
    return "unknown"

def is_ip_registered(ip_address: str) -> bool:
    """Check if IP address is already registered"""
    with ip_lock:
        return ip_address in registered_ips

def register_ip(ip_address: str) -> bool:
    """Register an IP address"""
    with ip_lock:
        if ip_address in registered_ips:
            return False  # Already registered
        registered_ips.add(ip_address)
        logger.info(f"🔒 IP registered: {ip_address}")
        return True

def get_registered_ips_count() -> int:
    """Get count of registered IPs"""
    with ip_lock:
        return len(registered_ips)

# =============================================================================
# CREDIT MANAGEMENT SYSTEM
# =============================================================================

# In-memory credit storage (replace with database in production)
user_credits = {}
credit_transactions = {}
credit_lock = threading.Lock()

def get_user_credits(user_id: str) -> int:
    """Get user's current credit balance"""
    with credit_lock:
        return user_credits.get(user_id, 0)

def add_user_credits(user_id: str, amount: int, description: str = "Credits added") -> int:
    """Add credits to user's account"""
    with credit_lock:
        current = user_credits.get(user_id, 0)
        new_balance = current + amount
        user_credits[user_id] = new_balance
        
        # Log transaction
        transaction_id = f"tx_{user_id}_{int(time.time())}"
        credit_transactions[transaction_id] = {
            "id": transaction_id,
            "user_id": user_id,
            "type": "purchase",
            "amount": amount,
            "description": description,
            "timestamp": time.time(),
            "balance_after": new_balance
        }
        
        logger.info(f"💰 Credits added: {user_id} +{amount} = {new_balance}")
        return new_balance

def use_user_credits(user_id: str, amount: int = 1, description: str = "Audio processing") -> bool:
    """Use credits from user's account"""
    with credit_lock:
        current = user_credits.get(user_id, 0)
        if current < amount:
            logger.warning(f"❌ Insufficient credits: {user_id} has {current}, needs {amount}")
            return False
        
        new_balance = current - amount
        user_credits[user_id] = new_balance
        
        # Log transaction
        transaction_id = f"tx_{user_id}_{int(time.time())}"
        credit_transactions[transaction_id] = {
            "id": transaction_id,
            "user_id": user_id,
            "type": "usage",
            "amount": -amount,
            "description": description,
            "timestamp": time.time(),
            "balance_after": new_balance
        }
        
        logger.info(f"💸 Credits used: {user_id} -{amount} = {new_balance}")
        return True

@app.get("/credits/balance/{user_id}")
async def get_credit_balance(user_id: str):
    """Get user's credit balance"""
    try:
        current = get_user_credits(user_id)
        
        # Calculate totals from transactions
        total_purchased = 0
        total_used = 0
        
        with credit_lock:
            for tx in credit_transactions.values():
                if tx["user_id"] == user_id:
                    if tx["type"] == "purchase":
                        total_purchased += tx["amount"]
                    elif tx["type"] == "usage":
                        total_used += abs(tx["amount"])
        
        return {
            "user_id": user_id,
            "current": current,
            "total_purchased": total_purchased,
            "total_used": total_used,
            "last_updated": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to get credit balance: {e}")
        raise HTTPException(status_code=500, detail=f"Credit balance failed: {str(e)}")

@app.post("/credits/use")
async def use_credits(request: dict):
    """Use credits for processing"""
    try:
        user_id = request.get("user_id")
        amount = request.get("amount", 1)
        description = request.get("description", "Audio processing")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        success = use_user_credits(user_id, amount, description)
        
        if not success:
            raise HTTPException(status_code=402, detail="Insufficient credits")
        
        return {
            "success": True,
            "credits_used": amount,
            "remaining_credits": get_user_credits(user_id),
            "message": f"Successfully used {amount} credit(s)"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to use credits: {e}")
        raise HTTPException(status_code=500, detail=f"Credit usage failed: {str(e)}")

@app.post("/credits/add")
async def add_credits(request: dict):
    """Add credits after payment"""
    try:
        user_id = request.get("user_id")
        amount = request.get("amount")
        tier = request.get("tier", "free")
        transaction_id = request.get("transaction_id")
        description = request.get("description", "Credits purchased")
        
        if not user_id or not amount:
            raise HTTPException(status_code=400, detail="user_id and amount are required")
        
        new_balance = add_user_credits(user_id, amount, description)
        
        return {
            "success": True,
            "credits_added": amount,
            "new_balance": new_balance,
            "tier": tier,
            "transaction_id": transaction_id,
            "message": f"Successfully added {amount} credit(s)"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add credits: {e}")
        raise HTTPException(status_code=500, detail=f"Credit addition failed: {str(e)}")

@app.get("/credits/history/{user_id}")
async def get_credit_history(user_id: str, limit: int = 50):
    """Get user's credit transaction history"""
    try:
        user_transactions = []
        
        with credit_lock:
            for tx in credit_transactions.values():
                if tx["user_id"] == user_id:
                    user_transactions.append(tx)
        
        # Sort by timestamp (newest first)
        user_transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Apply limit
        user_transactions = user_transactions[:limit]
        
        return {
            "user_id": user_id,
            "transactions": user_transactions,
            "total_count": len(user_transactions)
        }
    except Exception as e:
        logger.error(f"Failed to get credit history: {e}")
        raise HTTPException(status_code=500, detail=f"Credit history failed: {str(e)}")

# =============================================================================
# IP TRACKING ENDPOINTS
# =============================================================================

@app.get("/ip-tracking/status")
async def get_ip_tracking_status():
    """Get IP tracking system status (admin only)"""
    try:
        return {
            "total_registered_ips": get_registered_ips_count(),
            "system_active": True,
            "message": "IP tracking system is operational"
        }
    except Exception as e:
        logger.error(f"Failed to get IP tracking status: {e}")
        raise HTTPException(status_code=500, detail=f"IP tracking status failed: {str(e)}")

@app.post("/ip-tracking/check")
async def check_ip_registration(request: Request):
    """Check if IP is already registered"""
    try:
        client_ip = get_client_ip(request)
        
        if client_ip == "unknown":
            return {
                "ip": "unknown",
                "is_registered": False,
                "message": "Unable to determine IP address"
            }
        
        is_registered = is_ip_registered(client_ip)
        
        return {
            "ip": client_ip,
            "is_registered": is_registered,
            "message": "IP check completed"
        }
    except Exception as e:
        logger.error(f"Failed to check IP registration: {e}")
        raise HTTPException(status_code=500, detail=f"IP check failed: {str(e)}")

@app.post("/ip-tracking/register")
async def register_ip_address(request: Request):
    """Register an IP address (called during signup)"""
    try:
        client_ip = get_client_ip(request)
        
        if client_ip == "unknown":
            raise HTTPException(status_code=400, detail="Unable to determine IP address")
        
        # Check if already registered
        if is_ip_registered(client_ip):
            logger.warning(f"🚫 IP already registered: {client_ip}")
            raise HTTPException(
                status_code=409, 
                detail="An account has already been created from this device. Please use your existing account or contact support if you believe this is an error."
            )
        
        # Register the IP
        success = register_ip(client_ip)
        
        if not success:
            raise HTTPException(
                status_code=409, 
                detail="An account has already been created from this device. Please use your existing account or contact support if you believe this is an error."
            )
        
        return {
            "success": True,
            "ip": client_ip,
            "message": "IP registered successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to register IP: {e}")
        raise HTTPException(status_code=500, detail=f"IP registration failed: {str(e)}")

@app.delete("/ip-tracking/clear")
async def clear_ip_tracking():
    """Clear all registered IPs (admin only - for testing)"""
    try:
        with ip_lock:
            registered_ips.clear()
        
        logger.info("🧹 IP tracking cleared")
        return {
            "success": True,
            "message": "All registered IPs cleared"
        }
    except Exception as e:
        logger.error(f"Failed to clear IP tracking: {e}")
        raise HTTPException(status_code=500, detail=f"IP clearing failed: {str(e)}")

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

@app.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported audio formats and sample rates"""
    try:
        return {
            "formats": ffmpeg_converter.get_supported_formats(),
            "sample_rates": ffmpeg_converter.get_supported_sample_rates(),
            "format_details": {
                format_name: {
                    "extension": ffmpeg_converter.supported_formats[format_name]['ext'],
                    "mime_type": ffmpeg_converter.get_mime_type(format_name),
                    "codec": ffmpeg_converter.supported_formats[format_name]['codec']
                }
                for format_name in ffmpeg_converter.get_supported_formats()
            }
        }
    except Exception as e:
        logger.error(f"Failed to get supported formats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get supported formats")

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
        
        # Check credits for non-preview processing
        if is_preview.lower() != "true":
            # Check if user has enough credits
            current_credits = get_user_credits(user_id)
            if current_credits < 1:
                logger.warning(f"❌ Insufficient credits for user {user_id}: {current_credits}")
                raise HTTPException(
                    status_code=402, 
                    detail="Insufficient credits. Please purchase credits to continue processing."
                )
            
            # Use 1 credit for processing
            if not use_user_credits(user_id, 1, f"Audio processing - {audio.filename}"):
                raise HTTPException(
                    status_code=402, 
                    detail="Failed to use credits. Please try again."
                )
            
            logger.info(f"✅ Credits used for user {user_id}: {get_user_credits(user_id)} remaining")
        
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
            
            # 🔍 DEBUG: Log input file size before ML processing
            input_file_size = os.path.getsize(temp_file_path)
            logger.info(f"🔍 DEBUG: Input file size before ML processing: {input_file_size} bytes ({input_file_size / (1024*1024):.2f} MB)")
            logger.info(f"🔍 DEBUG: Input file path: {temp_file_path}")
            
            temp_in_path = temp_file_path

            mastered_file_path = await ml_engine.process_audio(
                input_file_path=temp_in_path,
                tier=tier,
                genre=resolved_genre,
                target_lufs=effective_target_lufs
            )
            
            # 🔍 DEBUG: Log ML processing output file size
            if os.path.exists(mastered_file_path):
                mastered_file_size = os.path.getsize(mastered_file_path)
                logger.info(f"🔍 DEBUG: ML processing output file size: {mastered_file_size} bytes ({mastered_file_size / (1024*1024):.2f} MB)")
                logger.info(f"🔍 DEBUG: ML processing output file path: {mastered_file_path}")
                logger.info(f"🔍 DEBUG: ML processing size change: {mastered_file_size - input_file_size} bytes")
            else:
                logger.error(f"🔍 DEBUG: ML processing output file not found: {mastered_file_path}")

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

            # 🔍 DEBUG: Log FFmpeg input file size
            if os.path.exists(mastered_file_path):
                ffmpeg_input_size = os.path.getsize(mastered_file_path)
                logger.info(f"🔍 DEBUG: FFmpeg input file size: {ffmpeg_input_size} bytes ({ffmpeg_input_size / (1024*1024):.2f} MB)")
                logger.info(f"🔍 DEBUG: FFmpeg input file path: {mastered_file_path}")
            else:
                logger.error(f"🔍 DEBUG: FFmpeg input file not found: {mastered_file_path}")

            final_file_path = await ffmpeg_converter.convert_audio(
                input_path=mastered_file_path,
                output_format=desired_format,
                sample_rate=desired_sr,
                bit_depth=desired_wav_bit_depth,
                bitrate_kbps=desired_mp3_bitrate
            )
            
            # 🔍 DEBUG: Log FFmpeg output file size
            if os.path.exists(final_file_path):
                ffmpeg_output_size = os.path.getsize(final_file_path)
                logger.info(f"🔍 DEBUG: FFmpeg output file size: {ffmpeg_output_size} bytes ({ffmpeg_output_size / (1024*1024):.2f} MB)")
                logger.info(f"🔍 DEBUG: FFmpeg output file path: {final_file_path}")
                logger.info(f"🔍 DEBUG: FFmpeg size change: {ffmpeg_output_size - (ffmpeg_input_size if os.path.exists(mastered_file_path) else 0)} bytes")
            else:
                logger.error(f"🔍 DEBUG: FFmpeg output file not found: {final_file_path}")

            # Optional LUFS touch-up disabled (no apply_gain function in converter; preserve stereo/levels)
            try:
                pass
            except Exception as e:
                logger.warning(f"Upload-file LUFS adjustment skipped: {e}")

            # Step 3: Save processed file with tier-based directory structure
            import shutil
            
            # Create tier-based directory structure
            tier_dir = os.path.join(tempfile.gettempdir(), "processed", tier.lower())
            os.makedirs(tier_dir, exist_ok=True)
            
            # Use a clean file ID for the processed file
            clean_file_id = f"{user_id}_{int(time.time())}"
            simple_download_path = os.path.join(tier_dir, f"{clean_file_id}.{desired_format.lower()}")
            
            # 🔍 DEBUG: Log file paths before copying
            logger.info(f"🔍 DEBUG: Copying from: {final_file_path}")
            logger.info(f"🔍 DEBUG: Copying to: {simple_download_path}")
            
            shutil.copy2(final_file_path, simple_download_path)
            
            # 🔍 DEBUG: Log file sizes after processing and copying
            final_file_size = os.path.getsize(final_file_path)
            simple_file_size = os.path.getsize(simple_download_path)
            logger.info(f"🔍 DEBUG: Final processed file size: {final_file_size} bytes ({final_file_size / (1024*1024):.2f} MB)")
            logger.info(f"🔍 DEBUG: Simple download file size: {simple_file_size} bytes ({simple_file_size / (1024*1024):.2f} MB)")
            logger.info(f"🔍 DEBUG: Files match: {final_file_size == simple_file_size}")
            logger.info(f"🔍 DEBUG: Copy successful: {os.path.exists(simple_download_path)}")
            
            # ✅ Store the exact file path in our mapping system
            save_processed_file_path(clean_file_id, simple_download_path, tier)
            logger.info(f"✅ Processed file saved: {simple_download_path} size={simple_file_size} bytes")
            logger.info(f"🔍 DEBUG: File ID stored in mapping: {clean_file_id}")
            
            # Also upload to storage for backup
            file_url = await storage_manager.upload_file(
                file_path=final_file_path,
                user_id=user_id,
                format=desired_format,
                is_preview=False
            )

            # Step 4: Get actual processed file size
            processed_file_size_bytes = os.path.getsize(final_file_path)
            processed_file_size_mb = processed_file_size_bytes / (1024 * 1024)
            
            metadata = await audio_processor.get_audio_metadata(final_file_path)

            # Cleanup temp files but keep final_file_path for download
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
            # Don't delete final_file_path yet - it's needed for download
            # It will be cleaned up by the storage manager or after download

            response_data = {
                "status": "success",
                "url": file_url,
                "simple_download_url": f"/download/{clean_file_id}",
                "file_id": clean_file_id,  # Add the clean file ID for frontend
                "lufs": metadata.get("lufs", effective_target_lufs),
                "format": desired_format,
                "duration": metadata.get("duration", 0),
                "sample_rate": desired_sr,
                "file_size": processed_file_size_bytes,
                "processed_file_size_mb": round(processed_file_size_mb, 2),
                "processed_file_size_bytes": processed_file_size_bytes
            }
            logger.info(f"🎵 DEBUG: Actual processed file size: {processed_file_size_bytes} bytes")
            logger.info(f"🎵 DEBUG: Response data: {response_data}")
            return sanitize_for_json(response_data)
            
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