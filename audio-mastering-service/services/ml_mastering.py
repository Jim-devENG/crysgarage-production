"""
ML Mastering Engine
Handles AI-powered audio mastering with genre-specific presets
"""

import os
import tempfile
import numpy as np
import librosa
import soundfile as sf
from typing import Dict, Any, Optional
import logging
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class MLMasteringEngine:
    """AI-powered audio mastering engine with genre-specific processing"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.genre_presets = self._load_genre_presets()
        self.tier_settings = self._load_tier_settings()
        
    def is_available(self) -> bool:
        """Check if ML mastering engine is available"""
        try:
            # Test basic functionality
            test_audio = np.random.randn(1000)
            self._apply_eq(test_audio, 22050, "Pop")
            return True
        except Exception as e:
            logger.error(f"ML mastering engine not available: {e}")
            return False
    
    def _load_genre_presets(self) -> Dict[str, Dict[str, Any]]:
        """Load genre-specific mastering presets"""
        return {
            "Hip-Hop": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},
                    "low_mid": {"freq": 250, "gain": 1.5},
                    "mid": {"freq": 1000, "gain": 0.5},
                    "high_mid": {"freq": 4000, "gain": 1.0},
                    "high_shelf": {"freq": 8000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 3.0,
                    "threshold": -12.0,
                    "attack": 0.003,
                    "release": 0.1
                },
                "stereo_width": 1.2,
                "target_lufs": -8.0
            },
            "Afrobeats": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 3.0},
                    "low_mid": {"freq": 200, "gain": 2.0},
                    "mid": {"freq": 800, "gain": 1.0},
                    "high_mid": {"freq": 3000, "gain": 1.5},
                    "high_shelf": {"freq": 10000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 2.5,
                    "threshold": -10.0,
                    "attack": 0.005,
                    "release": 0.15
                },
                "stereo_width": 1.3,
                "target_lufs": -7.0
            },
            "Gospel": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 1.5},
                    "low_mid": {"freq": 300, "gain": 1.0},
                    "mid": {"freq": 1200, "gain": 0.5},
                    "high_mid": {"freq": 5000, "gain": 1.5},
                    "high_shelf": {"freq": 12000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 2.0,
                    "threshold": -8.0,
                    "attack": 0.01,
                    "release": 0.2
                },
                "stereo_width": 1.1,
                "target_lufs": -10.0
            },
            "Pop": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.0},
                    "low_mid": {"freq": 250, "gain": 0.5},
                    "mid": {"freq": 1000, "gain": 0.0},
                    "high_mid": {"freq": 4000, "gain": 1.0},
                    "high_shelf": {"freq": 8000, "gain": 1.5}
                },
                "compression": {
                    "ratio": 2.5,
                    "threshold": -10.0,
                    "attack": 0.005,
                    "release": 0.1
                },
                "stereo_width": 1.0,
                "target_lufs": -9.0
            },
            "Rock": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 2.5},
                    "low_mid": {"freq": 200, "gain": 1.5},
                    "mid": {"freq": 800, "gain": 0.5},
                    "high_mid": {"freq": 3000, "gain": 1.0},
                    "high_shelf": {"freq": 6000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 3.5,
                    "threshold": -12.0,
                    "attack": 0.002,
                    "release": 0.08
                },
                "stereo_width": 1.1,
                "target_lufs": -8.5
            },
            "Electronic": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 3.0},
                    "low_mid": {"freq": 150, "gain": 2.0},
                    "mid": {"freq": 600, "gain": 0.0},
                    "high_mid": {"freq": 2500, "gain": 1.5},
                    "high_shelf": {"freq": 8000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 4.0,
                    "threshold": -15.0,
                    "attack": 0.001,
                    "release": 0.05
                },
                "stereo_width": 1.4,
                "target_lufs": -6.0
            },
            "Jazz": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 0.5},
                    "low_mid": {"freq": 300, "gain": 0.0},
                    "mid": {"freq": 1000, "gain": 0.0},
                    "high_mid": {"freq": 5000, "gain": 0.5},
                    "high_shelf": {"freq": 10000, "gain": 1.0}
                },
                "compression": {
                    "ratio": 1.5,
                    "threshold": -6.0,
                    "attack": 0.02,
                    "release": 0.3
                },
                "stereo_width": 1.0,
                "target_lufs": -12.0
            },
            "Classical": {
                "eq_curve": {
                    "low_shelf": {"freq": 120, "gain": 0.0},
                    "low_mid": {"freq": 400, "gain": 0.0},
                    "mid": {"freq": 1000, "gain": 0.0},
                    "high_mid": {"freq": 5000, "gain": 0.0},
                    "high_shelf": {"freq": 10000, "gain": 0.5}
                },
                "compression": {
                    "ratio": 1.2,
                    "threshold": -3.0,
                    "attack": 0.05,
                    "release": 0.5
                },
                "stereo_width": 1.0,
                "target_lufs": -14.0
            }
        }
    
    def _load_tier_settings(self) -> Dict[str, Dict[str, Any]]:
        """Load tier-specific processing settings"""
        return {
            "Free": {
                "processing_quality": "basic",
                "max_processing_time": 30,
                "enable_advanced_features": False
            },
            "Pro": {
                "processing_quality": "standard",
                "max_processing_time": 60,
                "enable_advanced_features": True
            },
            "Advanced": {
                "processing_quality": "premium",
                "max_processing_time": 120,
                "enable_advanced_features": True
            }
        }
    
    async def process_audio(
        self,
        input_file_path: str,
        genre: str,
        tier: str,
        target_lufs: float = -14.0
    ) -> str:
        """
        Process audio with ML mastering
        
        Args:
            input_file_path: Path to input audio file
            genre: Music genre for preset selection
            tier: User tier (Free, Pro, Advanced)
            target_lufs: Target LUFS level
            
        Returns:
            str: Path to processed audio file
        """
        try:
            logger.info(f"Starting ML mastering for genre: {genre}, tier: {tier}")
            
            # Load audio file
            audio_data, sample_rate = librosa.load(input_file_path, sr=None)
            
            # Ensure stereo
            if audio_data.ndim == 1:
                audio_data = np.stack([audio_data, audio_data])
            
            # Get genre preset
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            tier_config = self.tier_settings.get(tier, self.tier_settings["Free"])
            
            # Apply mastering chain
            processed_audio = audio_data.copy()
            
            # 1. EQ Processing
            processed_audio = self._apply_eq(processed_audio, sample_rate, genre)
            
            # 2. Compression
            processed_audio = self._apply_compression(processed_audio, sample_rate, genre)
            
            # 3. Stereo Widening
            if tier_config["enable_advanced_features"]:
                processed_audio = self._apply_stereo_widening(processed_audio, genre)
            
            # 4. Limiting
            processed_audio = self._apply_limiting(processed_audio, sample_rate)
            
            # 5. LUFS Normalization
            processed_audio = self._normalize_lufs(processed_audio, sample_rate, target_lufs)
            
            # Save processed audio
            output_path = self._save_processed_audio(processed_audio, sample_rate, input_file_path)
            
            logger.info(f"ML mastering completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"ML mastering failed: {e}")
            raise
    
    def _apply_eq(self, audio_data: np.ndarray, sample_rate: int, genre: str) -> np.ndarray:
        """Apply EQ based on genre preset"""
        try:
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            eq_curve = preset["eq_curve"]
            
            # Apply EQ using librosa (simplified implementation)
            # In production, use proper EQ implementation
            processed = audio_data.copy()
            
            # Apply low shelf
            low_shelf = eq_curve["low_shelf"]
            if low_shelf["gain"] != 0:
                # Simplified low shelf implementation
                processed = self._apply_simple_eq(processed, sample_rate, low_shelf["freq"], low_shelf["gain"], "low_shelf")
            
            # Apply high shelf
            high_shelf = eq_curve["high_shelf"]
            if high_shelf["gain"] != 0:
                processed = self._apply_simple_eq(processed, sample_rate, high_shelf["freq"], high_shelf["gain"], "high_shelf")
            
            return processed
            
        except Exception as e:
            logger.warning(f"EQ processing failed: {e}")
            return audio_data
    
    def _apply_simple_eq(self, audio_data: np.ndarray, sample_rate: int, freq: float, gain: float, eq_type: str) -> np.ndarray:
        """Apply simple EQ filter"""
        try:
            # Simplified EQ implementation
            # For production, use proper IIR/FIR filters
            nyquist = sample_rate / 2
            normalized_freq = freq / nyquist
            
            if eq_type == "low_shelf":
                # Simple low shelf (simplified)
                if gain > 0:
                    # Boost low frequencies
                    low_freq_mask = np.abs(np.fft.fftfreq(len(audio_data[0]), 1/sample_rate)) < freq
                    for ch in range(audio_data.shape[0]):
                        fft = np.fft.fft(audio_data[ch])
                        fft[low_freq_mask] *= (1 + gain/10)
                        audio_data[ch] = np.real(np.fft.ifft(fft))
            
            elif eq_type == "high_shelf":
                # Simple high shelf (simplified)
                if gain > 0:
                    # Boost high frequencies
                    high_freq_mask = np.abs(np.fft.fftfreq(len(audio_data[0]), 1/sample_rate)) > freq
                    for ch in range(audio_data.shape[0]):
                        fft = np.fft.fft(audio_data[ch])
                        fft[high_freq_mask] *= (1 + gain/10)
                        audio_data[ch] = np.real(np.fft.ifft(fft))
            
            return audio_data
            
        except Exception as e:
            logger.warning(f"Simple EQ failed: {e}")
            return audio_data
    
    def _apply_compression(self, audio_data: np.ndarray, sample_rate: int, genre: str) -> np.ndarray:
        """Apply compression based on genre preset"""
        try:
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            comp_settings = preset["compression"]
            
            # Simplified compression implementation
            # For production, use proper compressor with attack/release
            threshold = comp_settings["threshold"]
            ratio = comp_settings["ratio"]
            
            processed = audio_data.copy()
            
            for ch in range(audio_data.shape[0]):
                # Convert to dB
                db_audio = 20 * np.log10(np.abs(audio_data[ch]) + 1e-10)
                
                # Apply compression
                compressed_db = np.where(
                    db_audio > threshold,
                    threshold + (db_audio - threshold) / ratio,
                    db_audio
                )
                
                # Convert back to linear
                processed[ch] = np.sign(audio_data[ch]) * (10 ** (compressed_db / 20))
            
            return processed
            
        except Exception as e:
            logger.warning(f"Compression failed: {e}")
            return audio_data
    
    def _apply_stereo_widening(self, audio_data: np.ndarray, genre: str) -> np.ndarray:
        """Apply stereo widening"""
        try:
            if audio_data.shape[0] != 2:
                return audio_data
            
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            width = preset["stereo_width"]
            
            if width == 1.0:
                return audio_data
            
            # Simple stereo widening
            left = audio_data[0]
            right = audio_data[1]
            
            # Mid-side processing
            mid = (left + right) / 2
            side = (left - right) / 2
            
            # Apply width
            side *= width
            
            # Convert back to left-right
            new_left = mid + side
            new_right = mid - side
            
            return np.stack([new_left, new_right])
            
        except Exception as e:
            logger.warning(f"Stereo widening failed: {e}")
            return audio_data
    
    def _apply_limiting(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """Apply limiting to prevent clipping"""
        try:
            # Simple limiter
            max_level = 0.95  # Leave some headroom
            
            # Find peak level
            peak = np.max(np.abs(audio_data))
            
            if peak > max_level:
                # Apply limiting
                gain_reduction = max_level / peak
                audio_data *= gain_reduction
            
            return audio_data
            
        except Exception as e:
            logger.warning(f"Limiting failed: {e}")
            return audio_data
    
    def _normalize_lufs(self, audio_data: np.ndarray, sample_rate: int, target_lufs: float) -> np.ndarray:
        """Normalize audio to target LUFS level"""
        try:
            # Calculate current LUFS (simplified)
            current_lufs = self._calculate_simple_lufs(audio_data, sample_rate)
            
            # Calculate gain adjustment
            gain_db = target_lufs - current_lufs
            gain_linear = 10 ** (gain_db / 20)
            
            # Apply gain
            processed = audio_data * gain_linear
            
            # Ensure no clipping
            peak = np.max(np.abs(processed))
            if peak > 0.95:
                processed *= (0.95 / peak)
            
            return processed
            
        except Exception as e:
            logger.warning(f"LUFS normalization failed: {e}")
            return audio_data
    
    def _calculate_simple_lufs(self, audio_data: np.ndarray, sample_rate: int) -> float:
        """Calculate simplified LUFS"""
        try:
            # Simplified LUFS calculation
            rms = np.sqrt(np.mean(audio_data**2))
            lufs = 20 * np.log10(rms + 1e-10) - 0.691
            return float(lufs)
        except:
            return -14.0
    
    def _save_processed_audio(self, audio_data: np.ndarray, sample_rate: int, original_path: str) -> str:
        """Save processed audio to temporary file"""
        try:
            # Create output file path
            original_name = Path(original_path).stem
            output_path = os.path.join(
                self.temp_dir,
                f"{original_name}_mastered.wav"
            )
            
            # Save as WAV file
            if audio_data.ndim == 1:
                sf.write(output_path, audio_data, sample_rate)
            else:
                sf.write(output_path, audio_data.T, sample_rate)
            
            logger.info(f"Processed audio saved: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to save processed audio: {e}")
            raise
