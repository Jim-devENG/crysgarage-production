"""
Audio Mastering Microservice
FastAPI-based service for professional audio mastering and format conversion
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
import os
import sentry_sdk
from datetime import datetime

from services.audio_processor import AudioProcessor
from services.ml_mastering import MLMasteringEngine
from services.storage_manager import StorageManager
from services.ffmpeg_converter import FFmpegConverter
from services.resource_monitor import resource_monitor
from models.request_models import MasteringRequest, MasteringResponse
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

# Optional noise reduction
try:
    import noisereduce as nr  # type: ignore
    _NR_AVAILABLE = True
except Exception:
    _NR_AVAILABLE = False

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
    """Get tier-specific processing information"""
    try:
        tier_info = ml_engine.get_tier_information()
        return {
            "status": "success",
            "tiers": tier_info,
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
                y, sr = sf.read(input_file_path, always_2d=False)
                # Convert to mono for reduction, then keep shape
                if y.ndim > 1:
                    y_mono = np.mean(y, axis=1)
                else:
                    y_mono = y
                y_denoised = nr.reduce_noise(y=y_mono, sr=sr, prop_decrease=0.75)
                # Write a temp denoised file
                denoised_path = input_file_path.replace("temp_", "den_", 1)
                sf.write(denoised_path, y_denoised, sr)
                input_file_path = denoised_path
                logger.info("Applied noise reduction pre-processing")
        except Exception as e:
            logger.warning(f"Noise reduction skipped: {e}")
        
        # Resolve genre name to known presets (case/alias tolerant)
        def _resolve_genre(g: str) -> str:
            g_lower = (g or "").strip().lower()
            if "hip" in g_lower:
                return "Hip-Hop"
            if "afro" in g_lower:
                return "Afrobeats"
            if "gospel" in g_lower:
                return "Gospel"
            if "rock" in g_lower:
                return "Rock"
            if "electronic" in g_lower:
                return "Electronic"
            if "jazz" in g_lower:
                return "Jazz"
            if "classical" in g_lower:
                return "Classical"
            if "pop" in g_lower:
                return "Pop"
            # Fallback: Title-case
            return g.title() if g else "Pop"

        resolved_genre = _resolve_genre(str(request.genre))

        # Process audio with ML mastering
        logger.info(f"Applying ML mastering for genre: {resolved_genre} (requested: {request.genre}), tier: {request.tier}")
        # Global LUFS policy: force all masters to -8 LUFS
        # Allow client to request low/medium/high targets for A/B level matching
        # Fallback to -8 LUFS if not provided
        try:
            client_target = float(getattr(request, 'target_lufs') or -8.0)
        except Exception:
            client_target = -8.0
        effective_target_lufs = client_target
        try:
            mastered_file_path = await ml_engine.process_audio(
                input_file_path=input_file_path,
                genre=resolved_genre,
                tier=request.tier,
                target_lufs=effective_target_lufs
            )
            logger.info(f"ML mastering completed: {mastered_file_path}")
        except Exception as e:
            logger.error(f"ML mastering failed: {e}")
            raise HTTPException(status_code=500, detail=f"ML mastering failed: {str(e)}")
        
        # Convert to target format
        logger.info(f"Converting to format: {request.target_format}, sample rate: {request.target_sample_rate}")
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

        # Post-conversion loudness touch-up to maintain -8 LUFS (all tiers)
        try:
            meta_conv = await audio_processor.get_audio_metadata(final_file_path)
            current_lufs = meta_conv.get("lufs", effective_target_lufs)
            gain_db = (effective_target_lufs - current_lufs)
            # Only adjust if difference > 0.5 dB
            if abs(gain_db) > 0.5:
                adjusted_path = await ffmpeg_converter.apply_gain(
                    input_path=final_file_path,
                    output_format=request.target_format.value,
                    sample_rate=request.target_sample_rate.value,
                    gain_db=gain_db
                )
                final_file_path = adjusted_path

            # Safety: clamp true peak/peak to avoid clipping after loudness adjustment
            try:
                import numpy as np
                import librosa
                y, sr = librosa.load(final_file_path, sr=None, mono=True)
                peak = float(np.max(np.abs(y)) + 1e-12)
                peak_dbfs = 20 * np.log10(peak)
                ceiling_dbfs = -3.0  # extra headroom to avoid buzz/near-clipping perception
                if peak_dbfs > ceiling_dbfs:
                    safety_gain_db = ceiling_dbfs - peak_dbfs
                    safe_path = await ffmpeg_converter.apply_gain(
                        input_path=final_file_path,
                        output_format=request.target_format.value,
                        sample_rate=request.target_sample_rate.value,
                        gain_db=safety_gain_db
                    )
                    final_file_path = safe_path
            except Exception as e:
                logger.warning(f"Peak safety clamp skipped: {e}")
        except Exception as e:
            logger.warning(f"Post-conversion LUFS adjustment skipped: {e}")
        
        # Upload to storage
        logger.info("Uploading mastered file to storage")
        file_url = await storage_manager.upload_file(
            file_path=final_file_path,
            user_id=request.user_id,
            format=request.target_format.value  # Convert enum to string
        )
        
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
    """Server-side proxy to download a remote file and stream it as an attachment to avoid CORS.
    Uses an async generator and forwards Content-Length/Content-Type when available to prevent
    incomplete chunked encoding issues on some browsers.
    Files are automatically deleted after 5 minutes of creation.
    """
    try:
        import aiohttp
        import urllib.parse
        import mimetypes

        parsed = urllib.parse.urlparse(file_url)
        filename = parsed.path.split('/')[-1] or 'mastered_audio'

        # Optimization: if the URL points to local Laravel storage, stream directly from disk
        try:
            if parsed.hostname in ("localhost", "127.0.0.1") and parsed.port in (8000, None) and parsed.path.startswith("/storage/mastered/"):
                local_name = filename
                local_base = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "crysgarage-backend-fresh", "storage", "app", "public", "mastered"))
                local_path = os.path.normpath(os.path.join(local_base, local_name))
                if os.path.isfile(local_path):
                    media_type = mimetypes.guess_type(local_path)[0] or "application/octet-stream"
                    return FileResponse(
                        path=local_path,
                        media_type=media_type,
                        filename=filename,
                        headers={'Cache-Control': 'no-cache'}
                    )
        except Exception as e:
            logger.warning(f"Local file optimization skipped: {e}")

        # Fallback: stream via HTTP proxy
        async with aiohttp.ClientSession() as session:
            async with session.get(file_url) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=502, detail=f"Upstream returned {resp.status}")

                upstream_ct = resp.headers.get('Content-Type', 'application/octet-stream')

                async def file_iter():
                    try:
                        while True:
                            chunk = await resp.content.read(64 * 1024)
                            if not chunk:
                                break
                            yield chunk
                    finally:
                        await resp.release()

                headers = {
                    'Content-Disposition': f'attachment; filename="{filename}"',
                    'Cache-Control': 'no-cache'
                }

                return StreamingResponse(file_iter(), media_type=upstream_ct, headers=headers)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proxy download failed: {e}")
        raise HTTPException(status_code=500, detail="Proxy download failed")

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
        "Professional": {
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

@app.get("/genre-presets")
async def get_industry_presets():
    """Return simplified industry presets for key genres used by the frontend for real-time preview."""
    try:
        genre_info = ml_engine.get_genre_information()
        # Normalize and pick two key presets; fall back to defaults if missing
        def pick(name: str) -> Dict[str, Any]:
            return genre_info.get(name) or genre_info.get(name.title()) or genre_info.get(name.capitalize()) or {
                "eq_curve": {
                    "low_shelf": {"freq": 120, "gain": 0},
                    "low_mid": {"freq": 250, "gain": 0},
                    "mid": {"freq": 1000, "gain": 0},
                    "high_mid": {"freq": 3000, "gain": 0},
                    "high_shelf": {"freq": 8000, "gain": 0},
                },
                "compression": {"ratio": 2, "threshold": -24, "attack": 0.01, "release": 0.25},
                "stereo_width": 1.0,
                "target_lufs": -14,
            }
        presets = {
            "Hip-Hop": pick("Hip-Hop"),
            "Afrobeats": pick("Afrobeats"),
        }
        return {"status": "success", "presets": presets, "timestamp": datetime.utcnow().isoformat()}
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
                if gl in ("afrobeats", "afro beats"):
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
                if gl == "shrap":
                    return "Shrap"
                if gl == "singeli":
                    return "Singeli"
                if gl in ("urban benga", "urbanbenga"):
                    return "Urban Benga"
                if gl in ("new benga", "newbenga"):
                    return "New Benga"
                
                # North African genres
                if gl in ("raï n'b", "rai n'b", "rai nb", "raï nb"):
                    return "Raï N'B"
                if gl in ("raï-hop", "rai-hop", "rai hop", "raï hop"):
                    return "Raï-hop"
                if gl in ("gnawa fusion", "gnawafusion"):
                    return "Gnawa Fusion"
                
           # Fusion genres
           if gl == "afrotrap":
               return "Afrotrap"
           if gl in ("afro-gospel", "afrogospel"):
               return "Afro-Gospel"
           if gl in ("urban gospel", "urbangospel"):
               return "Urban Gospel"
           
           # Advanced tier genres
           if gl == "trap":
               return "Trap"
           if gl == "drill":
               return "Drill"
           if gl == "dubstep":
               return "Dubstep"
           if gl in ("r&b", "rnb", "rnb/soul", "r and b", "r n b"):
               return "R&B"
           if gl in ("lofi-hiphop", "lofi hiphop", "lofi", "lo-fi"):
               return "Lofi Hip-Hop"
           if gl in ("hip-hop", "hip hop", "hiphop"):
               return "Hip-Hop"
           if gl == "house":
               return "House"
           if gl == "techno":
               return "Techno"
           if gl == "highlife":
               return "Highlife"
           if gl in ("instrumentals", "instrumental"):
               return "Instrumentals"
           if gl == "beats":
               return "Beats"
           if gl == "trance":
               return "Trance"
           if gl in ("drum-bass", "drum and bass", "drum&bass"):
               return "Drum & Bass"
           if gl == "reggae":
               return "Reggae"
           if gl in ("voice-over", "voiceover", "voice over"):
               return "Voice Over"
           if gl in ("journalist", "journalism"):
               return "Journalist"
           if gl == "soul":
               return "Soul"
           if gl in ("content-creator", "contentcreator", "content creator"):
               return "Content Creator"
           if gl == "pop":
               return "Pop"
           if gl == "jazz":
               return "Jazz"
           if gl in ("crysgarage", "crys garage"):
               return "CrysGarage"
                
                # Legacy fallbacks
                if "hip" in gl:
                    return "Hip-Hop"
                if gl in ("r&b", "rnb", "rnb/soul", "r and b", "r n b"):
                    return "R&B"
                if "house" in gl:
                    return "House"
                if "trap" in gl:
                    return "Trap"
                if "gospel" in gl:
                    return "Gospel"
                if "rock" in gl:
                    return "Rock"
                if "electronic" in gl:
                    return "Electronic"
                if "jazz" in gl:
                    return "Jazz"
                if "classical" in gl:
                    return "Classical"
                if "pop" in gl:
                    return "Pop"
                return g.title() if g else "Afrobeats"

            resolved_genre = _resolve_genre_name(genre)
            # Allow client-provided target LUFS (low/medium/high), default -8 LUFS
            try:
                effective_target_lufs = float(target_lufs) if target_lufs is not None else -8.0
            except Exception:
                effective_target_lufs = -8.0

            # Step 1: Mastering
            try:
                if _NR_AVAILABLE:
                    import soundfile as sf
                    import numpy as np
                    y, sr = sf.read(temp_file_path, always_2d=False)
                    if y.ndim > 1:
                        y_mono = np.mean(y, axis=1)
                    else:
                        y_mono = y
                    y_denoised = nr.reduce_noise(y=y_mono, sr=sr, prop_decrease=0.75)
                    den_path = temp_file_path.replace("temp_", "den_", 1)
                    sf.write(den_path, y_denoised, sr)
                    temp_in_path = den_path
                else:
                    temp_in_path = temp_file_path
            except Exception:
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

            # Optional: loudness touch-up and peak safety (reuse logic from /master if needed)
            try:
                meta_conv = await audio_processor.get_audio_metadata(final_file_path)
                current_lufs = meta_conv.get("lufs", effective_target_lufs)
                gain_db = (effective_target_lufs - current_lufs)
                if abs(gain_db) > 0.5:
                    adjusted_path = await ffmpeg_converter.apply_gain(
                        input_path=final_file_path,
                        output_format=desired_format,
                        sample_rate=desired_sr,
                        gain_db=gain_db
                    )
                    final_file_path = adjusted_path
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

            return {
                "status": "success",
                "url": file_url,
                "lufs": metadata.get("lufs", effective_target_lufs),
                "format": desired_format,
                "duration": metadata.get("duration", 0),
                "sample_rate": desired_sr,
                "file_size": metadata.get("file_size", 0)
            }
            
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        # Clean up temp file if it exists
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


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
        port=8000,
        reload=True,
        log_level="info"
    )