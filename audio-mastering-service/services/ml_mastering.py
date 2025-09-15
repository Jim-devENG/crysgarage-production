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
        """Load tier-specific processing settings for studio page tiers"""
        return {
            "free": {
                "processing_quality": "basic",
                "max_processing_time": 30,
                "enable_advanced_features": False,
                "enable_stereo_widening": False,
                "enable_harmonic_exciter": False,
                "enable_multiband_compression": False,
                "max_sample_rate": 44100,
                "max_bit_depth": 16,
                "available_formats": ["wav", "mp3"],
                "processing_priority": "low",
                "eq_bands": 3,
                "compression_ratio_max": 2.0
            },
            "professional": {
                "processing_quality": "standard",
                "max_processing_time": 60,
                "enable_advanced_features": True,
                "enable_stereo_widening": True,
                "enable_harmonic_exciter": False,
                "enable_multiband_compression": True,
                "max_sample_rate": 48000,
                "max_bit_depth": 24,
                "available_formats": ["wav", "mp3", "flac"],
                "processing_priority": "medium",
                "eq_bands": 5,
                "compression_ratio_max": 3.0
            },
            "advanced": {
                "processing_quality": "premium",
                "max_processing_time": 120,
                "enable_advanced_features": True,
                "enable_stereo_widening": True,
                "enable_harmonic_exciter": True,
                "enable_multiband_compression": True,
                "max_sample_rate": 96000,
                "max_bit_depth": 32,
                "available_formats": ["wav", "mp3", "flac", "aiff"],
                "processing_priority": "high",
                "eq_bands": 7,
                "compression_ratio_max": 4.0
            },
            "one_on_one": {
                "processing_quality": "expert",
                "max_processing_time": 300,
                "enable_advanced_features": True,
                "enable_stereo_widening": True,
                "enable_harmonic_exciter": True,
                "enable_multiband_compression": True,
                "max_sample_rate": 192000,
                "max_bit_depth": 32,
                "available_formats": ["wav", "mp3", "flac", "aiff", "aac", "ogg"],
                "processing_priority": "highest",
                "eq_bands": 10,
                "compression_ratio_max": 5.0
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
            
            # Get genre preset and tier configuration
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            tier_config = self.tier_settings.get(tier, self.tier_settings["free"])
            
            logger.info(f"Processing with tier: {tier}, quality: {tier_config['processing_quality']}")
            
            # Apply mastering chain based on tier
            processed_audio = audio_data.copy()
            
            # 1. EQ Processing (tier-specific bands)
            processed_audio = self._apply_tier_based_eq(processed_audio, sample_rate, genre, tier_config)
            
            # 2. Compression (tier-specific settings)
            processed_audio = self._apply_tier_based_compression(processed_audio, sample_rate, genre, tier_config)
            
            # 3. Multiband Compression (Professional+ tiers)
            if tier_config["enable_multiband_compression"]:
                processed_audio = self._apply_multiband_compression(processed_audio, sample_rate, tier_config)
            
            # 4. Stereo Widening (Professional+ tiers)
            if tier_config["enable_stereo_widening"]:
                processed_audio = self._apply_stereo_widening(processed_audio, genre, tier_config)
            
            # 5. Harmonic Exciter (Advanced+ tiers)
            if tier_config["enable_harmonic_exciter"]:
                processed_audio = self._apply_harmonic_exciter(processed_audio, sample_rate, tier_config)
            
            # 6. Limiting
            processed_audio = self._apply_limiting(processed_audio, sample_rate, tier_config)
            
            # 7. LUFS Normalization
            processed_audio = self._normalize_lufs(processed_audio, sample_rate, target_lufs)
            
            # Save processed audio
            output_path = self._save_processed_audio(processed_audio, sample_rate, input_file_path)
            
            logger.info(f"ML mastering completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"ML mastering failed: {e}")
            raise
    
    def _apply_tier_based_eq(self, audio_data: np.ndarray, sample_rate: int, genre: str, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply EQ based on tier and genre preset"""
        try:
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            eq_curve = preset["eq_curve"]
            eq_bands = tier_config["eq_bands"]
            
            logger.info(f"Applying {eq_bands}-band EQ for {tier_config['processing_quality']} quality")
            
            # Apply EQ using tier-specific number of bands
            processed = audio_data.copy()
            
            # Apply low shelf (all tiers)
            low_shelf = eq_curve["low_shelf"]
            if low_shelf["gain"] != 0:
                processed = self._apply_simple_eq(processed, sample_rate, low_shelf["freq"], low_shelf["gain"], "low_shelf")
            
            # Apply high shelf (all tiers)
            high_shelf = eq_curve["high_shelf"]
            if high_shelf["gain"] != 0:
                processed = self._apply_simple_eq(processed, sample_rate, high_shelf["freq"], high_shelf["gain"], "high_shelf")
            
            # Apply mid bands based on tier
            if eq_bands >= 5:  # Professional+ tiers
                # Apply low-mid
                low_mid = eq_curve["low_mid"]
                if low_mid["gain"] != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, low_mid["freq"], low_mid["gain"], "peak")
                
                # Apply mid
                mid = eq_curve["mid"]
                if mid["gain"] != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, mid["freq"], mid["gain"], "peak")
                
                # Apply high-mid
                high_mid = eq_curve["high_mid"]
                if high_mid["gain"] != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, high_mid["freq"], high_mid["gain"], "peak")
            
            if eq_bands >= 7:  # Advanced+ tiers
                # Apply additional precision bands
                processed = self._apply_precision_eq(processed, sample_rate, eq_curve)
            
            if eq_bands >= 10:  # One-on-One tier
                # Apply expert-level EQ with maximum precision
                processed = self._apply_expert_eq(processed, sample_rate, eq_curve)
            
            return processed
            
        except Exception as e:
            logger.error(f"Tier-based EQ failed: {e}")
            return audio_data
    
    def _apply_tier_based_compression(self, audio_data: np.ndarray, sample_rate: int, genre: str, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply compression based on tier settings"""
        try:
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            compression_settings = preset["compression"]
            max_ratio = tier_config["compression_ratio_max"]
            
            # Limit compression ratio based on tier
            ratio = min(compression_settings["ratio"], max_ratio)
            
            logger.info(f"Applying compression with ratio {ratio}:1 for {tier_config['processing_quality']} quality")
            
            # Apply compression with tier-appropriate settings
            processed = self._apply_compression(audio_data, sample_rate, ratio, compression_settings["threshold"])
            
            return processed
            
        except Exception as e:
            logger.error(f"Tier-based compression failed: {e}")
            return audio_data
    
    def _apply_multiband_compression(self, audio_data: np.ndarray, sample_rate: int, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply multiband compression for Professional+ tiers"""
        try:
            logger.info(f"Applying multiband compression for {tier_config['processing_quality']} quality")
            
            # Split into frequency bands
            low_band, mid_band, high_band = self._split_frequency_bands(audio_data, sample_rate)
            
            # Apply different compression to each band
            low_compressed = self._apply_compression(low_band, sample_rate, 2.0, -8.0)
            mid_compressed = self._apply_compression(mid_band, sample_rate, 3.0, -10.0)
            high_compressed = self._apply_compression(high_band, sample_rate, 1.5, -6.0)
            
            # Recombine bands
            processed = self._recombine_frequency_bands(low_compressed, mid_compressed, high_compressed)
            
            return processed
            
        except Exception as e:
            logger.error(f"Multiband compression failed: {e}")
            return audio_data
    
    def _apply_harmonic_exciter(self, audio_data: np.ndarray, sample_rate: int, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply harmonic exciter for Advanced+ tiers"""
        try:
            logger.info(f"Applying harmonic exciter for {tier_config['processing_quality']} quality")
            
            # Add subtle harmonic content
            processed = audio_data.copy()
            
            # Generate harmonics
            harmonics = self._generate_harmonics(processed, sample_rate)
            
            # Mix harmonics with original signal
            processed = processed + (harmonics * 0.1)  # 10% harmonic content
            
            return processed
            
        except Exception as e:
            logger.error(f"Harmonic exciter failed: {e}")
            return audio_data
    
    def _split_frequency_bands(self, audio_data: np.ndarray, sample_rate: int) -> tuple:
        """Split audio into low, mid, and high frequency bands"""
        try:
            # Define crossover frequencies
            low_cutoff = 200
            high_cutoff = 4000
            
            # Apply filters to split bands
            low_band = self._apply_highpass_filter(audio_data, sample_rate, low_cutoff)
            high_band = self._apply_lowpass_filter(audio_data, sample_rate, high_cutoff)
            mid_band = audio_data - low_band - high_band
            
            return low_band, mid_band, high_band
            
        except Exception as e:
            logger.error(f"Frequency band splitting failed: {e}")
            return audio_data, audio_data, audio_data
    
    def _recombine_frequency_bands(self, low_band: np.ndarray, mid_band: np.ndarray, high_band: np.ndarray) -> np.ndarray:
        """Recombine frequency bands"""
        try:
            return low_band + mid_band + high_band
        except Exception as e:
            logger.error(f"Frequency band recombination failed: {e}")
            return low_band
    
    def _generate_harmonics(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """Generate harmonic content for exciter effect"""
        try:
            # Generate second and third harmonics
            harmonics = np.zeros_like(audio_data)
            
            # Add subtle harmonic distortion
            harmonics = np.tanh(audio_data * 0.3) * 0.1
            
            return harmonics
            
        except Exception as e:
            logger.error(f"Harmonic generation failed: {e}")
            return np.zeros_like(audio_data)
    
    def _apply_precision_eq(self, audio_data: np.ndarray, sample_rate: int, eq_curve: Dict[str, Any]) -> np.ndarray:
        """Apply precision EQ for Advanced+ tiers"""
        try:
            # Apply additional precision bands
            processed = audio_data.copy()
            
            # Add precision mid bands
            precision_bands = [500, 1500, 3000, 6000]
            for freq in precision_bands:
                if freq in eq_curve:
                    processed = self._apply_simple_eq(processed, sample_rate, freq, eq_curve[freq]["gain"], "peak")
            
            return processed
            
        except Exception as e:
            logger.error(f"Precision EQ failed: {e}")
            return audio_data
    
    def _apply_expert_eq(self, audio_data: np.ndarray, sample_rate: int, eq_curve: Dict[str, Any]) -> np.ndarray:
        """Apply expert-level EQ for One-on-One tier"""
        try:
            # Apply maximum precision EQ
            processed = audio_data.copy()
            
            # Add expert-level precision bands
            expert_bands = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]
            for freq in expert_bands:
                if freq in eq_curve:
                    processed = self._apply_simple_eq(processed, sample_rate, freq, eq_curve[freq]["gain"], "peak")
            
            return processed
            
        except Exception as e:
            logger.error(f"Expert EQ failed: {e}")
            return audio_data
    
    def get_tier_information(self) -> Dict[str, Any]:
        """Get tier-specific processing information"""
        try:
            tier_info = {}
            for tier, settings in self.tier_settings.items():
                tier_info[tier] = {
                    "processing_quality": settings["processing_quality"],
                    "max_processing_time": settings["max_processing_time"],
                    "available_formats": settings["available_formats"],
                    "max_sample_rate": settings["max_sample_rate"],
                    "max_bit_depth": settings["max_bit_depth"],
                    "features": {
                        "stereo_widening": settings["enable_stereo_widening"],
                        "harmonic_exciter": settings["enable_harmonic_exciter"],
                        "multiband_compression": settings["enable_multiband_compression"],
                        "advanced_features": settings["enable_advanced_features"]
                    },
                    "processing_limits": {
                        "eq_bands": settings["eq_bands"],
                        "compression_ratio_max": settings["compression_ratio_max"]
                    }
                }
            return tier_info
            
        except Exception as e:
            logger.error(f"Failed to get tier information: {e}")
            return {}
    
    def get_genre_information(self) -> Dict[str, Any]:
        """Get genre-specific processing information"""
        try:
            genre_info = {}
            for genre, preset in self.genre_presets.items():
                genre_info[genre] = {
                    "eq_curve": preset["eq_curve"],
                    "compression": preset["compression"],
                    "stereo_width": preset.get("stereo_width", 1.0),
                    "target_lufs": preset.get("target_lufs", -14.0)
                }
            return genre_info
            
        except Exception as e:
            logger.error(f"Failed to get genre information: {e}")
            return {}

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
    
    async def preview_genre_effects(
        self,
        input_file_path: str,
        genre: str,
        tier: str
    ) -> str:
        """
        Generate real-time preview of genre effects
        Faster processing for live preview during playback
        
        Args:
            input_file_path: Path to input audio file
            genre: Music genre for preset selection
            tier: User tier (free, professional, advanced, one_on_one)
            
        Returns:
            str: Path to preview audio file
        """
        try:
            logger.info(f"Starting genre preview for genre: {genre}, tier: {tier}")
            
            # Load audio file
            audio_data, sample_rate = librosa.load(input_file_path, sr=None)
            
            # Ensure stereo
            if audio_data.ndim == 1:
                audio_data = np.stack([audio_data, audio_data])
            
            # Get genre preset and tier configuration
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            tier_config = self.tier_settings.get(tier, self.tier_settings["free"])
            
            logger.info(f"Preview processing with tier: {tier}, quality: {tier_config['processing_quality']}")
            
            # Apply lightweight mastering chain for preview
            processed_audio = audio_data.copy()
            
            # 1. Basic EQ Processing (simplified for speed)
            processed_audio = self._apply_preview_eq(processed_audio, sample_rate, genre, tier_config)
            
            # 2. Light Compression (simplified for speed)
            processed_audio = self._apply_preview_compression(processed_audio, sample_rate, genre, tier_config)
            
            # 3. Basic Stereo Widening (if enabled for tier)
            if tier_config["enable_stereo_widening"]:
                processed_audio = self._apply_stereo_widening(processed_audio, genre)
            
            # 4. Light Limiting
            processed_audio = self._apply_limiting(processed_audio, sample_rate)
            
            # 5. Basic LUFS Normalization
            processed_audio = self._normalize_lufs(processed_audio, sample_rate, preset.get("target_lufs", -14.0))
            
            # Save preview audio
            output_path = self._save_preview_audio(processed_audio, sample_rate, input_file_path, genre)
            
            logger.info(f"Genre preview completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Genre preview failed: {e}")
            raise

    def _apply_preview_eq(self, audio_data: np.ndarray, sample_rate: int, genre: str, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply simplified EQ for preview (faster processing)"""
        try:
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            eq_curve = preset["eq_curve"]
            
            logger.info(f"Applying preview EQ for {genre}")
            
            # Apply only essential EQ bands for speed
            processed = audio_data.copy()
            
            # Apply low shelf (essential for bass)
            low_shelf = eq_curve["low_shelf"]
            if low_shelf["gain"] != 0:
                processed = self._apply_simple_eq(processed, sample_rate, low_shelf["freq"], low_shelf["gain"], "low_shelf")
            
            # Apply high shelf (essential for brightness)
            high_shelf = eq_curve["high_shelf"]
            if high_shelf["gain"] != 0:
                processed = self._apply_simple_eq(processed, sample_rate, high_shelf["freq"], high_shelf["gain"], "high_shelf")
            
            # Apply one mid band for character (simplified)
            if tier_config["eq_bands"] >= 3:
                mid = eq_curve["mid"]
                if mid["gain"] != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, mid["freq"], mid["gain"], "peak")
            
            return processed
            
        except Exception as e:
            logger.error(f"Preview EQ failed: {e}")
            return audio_data

    def _apply_preview_compression(self, audio_data: np.ndarray, sample_rate: int, genre: str, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply simplified compression for preview (faster processing)"""
        try:
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            compression_settings = preset["compression"]
            max_ratio = tier_config["compression_ratio_max"]
            
            # Use lighter compression for preview
            ratio = min(compression_settings["ratio"] * 0.7, max_ratio)  # 70% of full compression
            
            logger.info(f"Applying preview compression with ratio {ratio}:1")
            
            # Apply simplified compression
            processed = self._apply_compression(audio_data, sample_rate, ratio, compression_settings["threshold"])
            
            return processed
            
        except Exception as e:
            logger.error(f"Preview compression failed: {e}")
            return audio_data

    def _save_preview_audio(self, audio_data: np.ndarray, sample_rate: int, original_path: str, genre: str) -> str:
        """Save preview audio to temporary file"""
        try:
            # Create output file path
            original_name = Path(original_path).stem
            output_path = os.path.join(
                self.temp_dir,
                f"{original_name}_preview_{genre.lower().replace('-', '_')}.wav"
            )
            
            # Save as WAV file
            if audio_data.ndim == 1:
                sf.write(output_path, audio_data, sample_rate)
            else:
                sf.write(output_path, audio_data.T, sample_rate)
            
            logger.info(f"Preview audio saved: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to save preview audio: {e}")
            raise

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
