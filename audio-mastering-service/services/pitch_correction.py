"""
Pitch Correction Service - DISABLED
This service was used to automatically fine-tune all audio to 444.0 Hz (A4) with smooth pitch shifting.
It has been disabled as per user request to remove 444 Hz tuning from the process entirely.
"""

import numpy as np
import librosa
import soundfile as sf
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class PitchCorrection:
    """Handles automatic pitch correction to 444.0 Hz"""
    
    def __init__(self):
        self.target_frequency = 444.0  # A4 in Hz
        self.sample_rate = 44100
        
    def detect_pitch(self, audio: np.ndarray, sr: int = 44100) -> Optional[float]:
        """
        Detect the fundamental frequency of the audio using YIN algorithm
        Returns the detected frequency in Hz, or None if no clear pitch detected
        """
        try:
            # Use YIN algorithm for robust pitch detection
            f0, voiced_flag, voiced_probs = librosa.pyin(
                audio,
                fmin=librosa.note_to_hz('C2'),  # ~65 Hz
                fmax=librosa.note_to_hz('C7'),  # ~2093 Hz
                sr=sr,
                frame_length=2048,
                hop_length=512
            )
            
            # Get the most common pitch (median of voiced frames)
            voiced_f0 = f0[voiced_flag]
            if len(voiced_f0) > 0:
                # Use median for robustness against outliers
                detected_pitch = np.median(voiced_f0[~np.isnan(voiced_f0)])
                if not np.isnan(detected_pitch) and detected_pitch > 0:
                    return float(detected_pitch)
            
            return None
            
        except Exception as e:
            logger.warning(f"Pitch detection failed: {e}")
            return None
    
    def calculate_cents_shift(self, original_freq: float, target_freq: float = 444.0) -> float:
        """
        Calculate the pitch shift needed in cents
        Formula: cents = 1200 * log2(target_freq / original_freq)
        """
        if original_freq <= 0:
            return 0.0
        
        cents = 1200 * np.log2(target_freq / original_freq)
        return float(cents)
    
    def smooth_pitch_shift(self, audio: np.ndarray, cents: float, sr: int = 44100) -> np.ndarray:
        """
        Apply smooth, natural pitch shifting with formant preservation when available.
        Prefers Rubber Band (pyrubberband) with formant preservation; falls back to librosa.
        """
        try:
            if abs(cents) < 1.0:
                return audio

            semitones = cents / 100.0

            # Try Rubber Band (formant-preserving)
            try:
                import pyrubberband as pyrb  # type: ignore
                y = audio.astype(np.float32, copy=False)
                # Prefer explicit formant preservation flag when supported by pyrubberband
                try:
                    shifted = pyrb.pitch_shift(y, sr, semitones, formant=True)  # type: ignore[arg-type]
                except TypeError:
                    # Older versions: pass no extras (still higher quality than pure PV)
                    shifted = pyrb.pitch_shift(y, sr, semitones)
                shifted = shifted.astype(np.float32, copy=False)
                shifted = self._apply_gentle_compression(shifted)
                return shifted
            except Exception as rb_err:
                logger.info(f"Rubber Band not available or failed ({rb_err}); falling back to librosa")

            # Fallback: librosa pitch shift
            shifted_audio = librosa.effects.pitch_shift(
                audio,
                sr=sr,
                n_steps=semitones,
                bins_per_octave=12
            )
            shifted_audio = self._apply_gentle_compression(shifted_audio)
            return shifted_audio

        except Exception as e:
            logger.error(f"Pitch shifting failed: {e}")
            return audio
    
    def _apply_gentle_compression(self, audio: np.ndarray, ratio: float = 1.5, threshold: float = 0.7) -> np.ndarray:
        """
        Apply gentle compression to maintain dynamics after pitch shifting
        """
        try:
            # Simple soft-knee compression
            compressed = np.copy(audio)
            
            # Apply compression to peaks above threshold
            mask = np.abs(compressed) > threshold
            compressed[mask] = np.sign(compressed[mask]) * (
                threshold + (np.abs(compressed[mask]) - threshold) / ratio
            )
            
            # Normalize to prevent clipping
            max_val = np.max(np.abs(compressed))
            if max_val > 0:
                compressed = compressed / max_val * 0.95  # Leave some headroom
            
            return compressed
            
        except Exception as e:
            logger.warning(f"Compression failed: {e}")
            return audio
    
    def correct_pitch(self, audio: np.ndarray, sr: int = 44100) -> Tuple[np.ndarray, dict]:
        """
        Main pitch correction function
        Returns corrected audio and metadata about the correction applied
        """
        try:
            # Detect original pitch
            original_pitch = self.detect_pitch(audio, sr)
            
            if original_pitch is None:
                # If no clear pitch detected, apply default shift to 444.0 Hz from 440.0 Hz
                # This ensures all audio gets fine-tuned to 444.0 Hz
                default_cents_shift = self.calculate_cents_shift(440.0, self.target_frequency)  # ~15.67 cents
                corrected_audio = self.smooth_pitch_shift(audio, default_cents_shift, sr)
                
                logger.info(f"No pitch detected, applying default correction: 440.0Hz -> {self.target_frequency}Hz ({default_cents_shift:+.1f} cents)")
                return corrected_audio, {
                    "pitch_corrected": True,
                    "original_pitch": None,
                    "target_pitch": self.target_frequency,
                    "cents_shift": default_cents_shift,
                    "reason": "Default correction applied (no pitch detected)"
                }
            
            # Calculate cents shift needed
            cents_shift = self.calculate_cents_shift(original_pitch, self.target_frequency)
            
            # Always apply pitch correction to tune to 444.0 Hz
            # This ensures all audio is fine-tuned regardless of original pitch
            corrected_audio = self.smooth_pitch_shift(audio, cents_shift, sr)
            
            logger.info(f"Pitch corrected: {original_pitch:.1f}Hz -> {self.target_frequency}Hz ({cents_shift:+.1f} cents)")
            
            return corrected_audio, {
                "pitch_corrected": True,
                "original_pitch": original_pitch,
                "target_pitch": self.target_frequency,
                "cents_shift": cents_shift,
                "reason": "Pitch corrected to 444.0 Hz"
            }
                
        except Exception as e:
            logger.error(f"Pitch correction failed: {e}")
            return audio, {
                "pitch_corrected": False,
                "original_pitch": None,
                "target_pitch": self.target_frequency,
                "cents_shift": 0.0,
                "reason": f"Error: {str(e)}"
            }
    
    def get_pitch_info(self, audio: np.ndarray, sr: int = 44100) -> dict:
        """
        Get detailed pitch information without applying correction
        """
        try:
            original_pitch = self.detect_pitch(audio, sr)
            
            if original_pitch is None:
                return {
                    "detected_pitch": None,
                    "target_pitch": self.target_frequency,
                    "cents_shift": 0.0,
                    "note_name": None,
                    "target_note": "A4"
                }
            
            cents_shift = self.calculate_cents_shift(original_pitch, self.target_frequency)
            
            # Convert frequency to note name
            note_name = self._frequency_to_note(original_pitch)
            
            return {
                "detected_pitch": original_pitch,
                "target_pitch": self.target_frequency,
                "cents_shift": cents_shift,
                "note_name": note_name,
                "target_note": "A4"
            }
            
        except Exception as e:
            logger.error(f"Pitch analysis failed: {e}")
            return {
                "detected_pitch": None,
                "target_pitch": self.target_frequency,
                "cents_shift": 0.0,
                "note_name": None,
                "target_note": "A4"
            }
    
    def _frequency_to_note(self, frequency: float) -> str:
        """
        Convert frequency to note name (e.g., 440.0 -> "A4")
        """
        try:
            # A4 = 440 Hz, but we're targeting 444 Hz
            # Calculate semitones from A4 (440 Hz)
            semitones = 12 * np.log2(frequency / 440.0)
            
            # Round to nearest semitone
            semitones_rounded = round(semitones)
            
            # Note names
            note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            
            # Calculate octave and note
            octave = 4 + (semitones_rounded // 12)
            note_index = semitones_rounded % 12
            
            return f"{note_names[note_index]}{octave}"
            
        except Exception as e:
            logger.warning(f"Note conversion failed: {e}")
            return "Unknown"
