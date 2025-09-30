import io
import json
import math
import tempfile
from typing import Dict, Any

import numpy as np
import soundfile as sf

try:
    import pyloudnorm as pyln
except Exception:  # pragma: no cover
    pyln = None


def _ensure_stereo_float32(audio: np.ndarray) -> np.ndarray:
    if audio.ndim == 1:
        audio = np.stack([audio, audio], axis=0)
    elif audio.ndim == 2:
        # Expect [channels, samples] or [samples, channels]
        if audio.shape[0] < audio.shape[1]:
            # Likely [samples, channels] -> transpose to [channels, samples]
            if audio.shape[1] in (1, 2):
                audio = audio.T
        # else assume already [channels, samples]
    audio = audio.astype(np.float32, copy=False)
    # Clamp any non-finite
    if not np.all(np.isfinite(audio)):
        audio = np.nan_to_num(audio, nan=0.0, posinf=1.0, neginf=-1.0)
        audio = np.clip(audio, -1.0, 1.0)
    # Ensure stereo
    if audio.shape[0] == 1:
        audio = np.vstack([audio, audio])
    return audio


def _compute_lufs(audio: np.ndarray, sample_rate: int) -> float:
    if pyln is None:
        return float('nan')
    meter = pyln.Meter(sample_rate)
    # pyln expects mono; average stereo for loudness
    mono = np.mean(audio, axis=0)
    try:
        return float(meter.integrated_loudness(mono))
    except Exception:
        return float('nan')


def _compute_rms_db(audio: np.ndarray) -> float:
    mono = np.mean(audio, axis=0)
    rms = np.sqrt(np.mean(mono**2) + 1e-12)
    return float(20.0 * np.log10(rms + 1e-12))


def _compute_peak_db(audio: np.ndarray) -> float:
    peak = np.max(np.abs(audio)) + 1e-12
    return float(20.0 * np.log10(peak))


def _compute_spectrum(audio: np.ndarray, sample_rate: int, n_fft: int = 4096) -> Dict[str, Any]:
    mono = np.mean(audio, axis=0)
    if mono.size == 0:
        return {"frequencies": [], "magnitudes_db": []}
    # Take centered window if very long
    length = mono.size
    if length > n_fft * 4:
        start = (length - n_fft * 4) // 2
        mono = mono[start:start + n_fft * 4]
    # FFT
    window = np.hanning(mono.size)
    spec = np.fft.rfft(mono * window, n=n_fft)
    mag = np.abs(spec)
    freqs = np.fft.rfftfreq(n_fft, d=1.0 / sample_rate)
    mag_db = 20.0 * np.log10(mag + 1e-9)
    return {
        "frequencies": freqs.tolist(),
        "magnitudes_db": mag_db.tolist(),
    }


def _compute_stereo_correlation(audio: np.ndarray) -> float:
    left = audio[0]
    right = audio[1]
    # Pearson correlation
    left_c = left - np.mean(left)
    right_c = right - np.mean(right)
    denom = (np.sqrt(np.sum(left_c ** 2)) * np.sqrt(np.sum(right_c ** 2))) + 1e-12
    corr = float(np.sum(left_c * right_c) / denom)
    # Clamp to [-1, 1]
    return max(-1.0, min(1.0, corr))


def analyze_audio_file(file_path: str) -> Dict[str, Any]:
    audio, sr = sf.read(file_path, dtype='float32', always_2d=False)
    # soundfile returns [samples, channels] for multi-channel; normalize
    if audio.ndim == 2:
        # [samples, channels] -> [channels, samples]
        audio = audio.T
    audio = _ensure_stereo_float32(audio)

    lufs = _compute_lufs(audio, sr)
    rms_db = _compute_rms_db(audio)
    peak_db = _compute_peak_db(audio)
    spectrum = _compute_spectrum(audio, sr)
    correlation = _compute_stereo_correlation(audio)

    return {
        "status": "ok",
        "metadata": {
            "lufs": lufs,
            "sample_rate": sr,
            "duration": float(audio.shape[1] / float(sr)),
        },
        "rms_db": rms_db,
        "peak_db": peak_db,
        "stereo_correlation": correlation,
        "spectrum": spectrum,
    }



