"""
ML Mastering Engine
Handles AI-powered audio mastering with genre-specific presets
"""

import os
import tempfile
import numpy as np
import soundfile as sf
from typing import Dict, Any
import logging
from pathlib import Path
import math
from .genre_presets import get_genre_presets

logger = logging.getLogger(__name__)

class MLMasteringEngine:
    """AI-powered audio mastering engine with genre-specific processing"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.genre_presets = get_genre_presets()  # Import from separate file
        self.tier_settings = self._load_tier_settings()
        
    def _load_audio(self, input_file_path: str) -> tuple:
        """Load audio from disk and return array shaped as [channels, samples].

        - Preserves original sample rate (sr=None)
        - Preserves stereo if present; duplicates mono to stereo
        - Ensures float32 data and finite values
        """
        try:
            # Use soundfile to avoid librosa/numba/llvmlite on Windows
            data, sample_rate = sf.read(input_file_path, always_2d=True)  # shape: (n_samples, n_channels)

            if data is None or data.size == 0:
                raise ValueError("Failed to load audio: empty result")

            # Ensure float32
            data = np.asarray(data, dtype=np.float32)
            data = np.nan_to_num(data, nan=0.0, posinf=0.0, neginf=0.0)

            # Ensure stereo: (n, ch) -> (2, n)
            if data.shape[1] == 1:
                mono = data[:, 0]
                audio_stereo = np.stack([mono, mono], axis=0)  # (2, n)
            else:
                # transpose to (channels, samples)
                audio_stereo = data.T  # (ch, n)

            # Clip to [-1, 1] if needed
            peak = float(np.max(np.abs(audio_stereo)))
            if peak > 1.0:
                audio_stereo = audio_stereo / peak

            return audio_stereo, sample_rate
        except Exception as e:
            logger.error(f"_load_audio failed: {e}")
            raise

    def _get_tier_config(self, tier: str) -> Dict[str, Any]:
        """Return normalized tier configuration.

        Accepts common aliases and casing: free/pro/advanced, etc.
        """
        try:
            normalized = (tier or "Free").strip().lower()
            if normalized in ["free", "basic"]:
                key = "Free"
            elif normalized in ["pro", "professional", "prof"]:
                key = "Professional"
            elif normalized in ["adv", "advanced", "premium"]:
                key = "Advanced"
            else:
                key = "Free"

            return self.tier_settings.get(key, self.tier_settings["Free"])
        except Exception as e:
            logger.error(f"_get_tier_config failed: {e}")
            return self.tier_settings["Free"]

    def _get_effective_target_lufs(self, genre: str, fallback_target: float) -> float:
        """Get genre-based target LUFS, clamped to current safety window when needed."""
        try:
            # Normalize genre name for case-insensitive lookup
            # Handle special characters and common variations
            if not genre:
                normalized_genre = "Pop"
            else:
                # Handle common variations
                genre_lower = genre.lower().strip()
                if genre_lower in ["r-b", "r&b", "rnb", "r and b"]:
                    normalized_genre = "R&B"
                elif genre_lower in ["hip-hop", "hiphop", "hip hop"]:
                    normalized_genre = "Hip Hop"
                elif genre_lower in ["drum-bass", "drum & bass", "dnb"]:
                    normalized_genre = "Drum & Bass"
                else:
                    normalized_genre = genre.title()
            genre_info = self.get_genre_information()
            genre_target = genre_info.get(normalized_genre, {}).get("target_lufs", fallback_target)

            # Current system enforces a -7 to -9 LUFS window later. Keep within a sane range here.
            # Do not over-constrain; just guard extremes.
            if not isinstance(genre_target, (int, float)):
                genre_target = fallback_target

            # Soft clamp to avoid extreme values
            genre_target = float(max(-23.0, min(0.0, genre_target)))
            return genre_target
        except Exception as e:
            logger.error(f"_get_effective_target_lufs failed: {e}")
            return fallback_target

    def is_available(self) -> bool:
        """Check if ML mastering engine is available"""
        try:
            # Test basic functionality
            test_audio = np.random.randn(1000)
            self._apply_simple_eq(test_audio, 22050, 1000, 1.0, "peak")
            return True
        except Exception as e:
            logger.error(f"ML mastering engine not available: {e}")
            return False
    
    def _load_tier_settings(self) -> Dict[str, Dict[str, Any]]:
        """Load tier-specific processing settings for studio page tiers"""
        return {
            "Free": {
                "processing_quality": "basic",
                "max_processing_time": 30,
                "enable_advanced_features": False,
                "enable_stereo_widening": True,
                "enable_harmonic_exciter": False,
                "enable_multiband_compression": False,
                "max_sample_rate": 44100,
                "max_bit_depth": 16,
                "available_formats": ["wav", "mp3"],
                "processing_priority": "low",
                "eq_bands": 3,
                "compression_ratio_max": 2.0
            },
            "Professional": {
                "processing_quality": "standard",
                "max_processing_time": 60,
                "enable_advanced_features": True,
                "enable_stereo_widening": False,  # Preserve original stereo; no widening
                "enable_harmonic_exciter": False,
                "enable_multiband_compression": True,
                "max_sample_rate": 48000,
                "max_bit_depth": 24,
                "available_formats": ["wav", "mp3", "flac"],
                "processing_priority": "medium",
                "eq_bands": 5,
                "compression_ratio_max": 3.0
            },
            "Advanced": {
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
                "compression_ratio_max": 5.0
            }
        }

    async def process_audio_advanced(
            self,
            input_file_path: str,
            genre: str,
            tier: str,
            target_lufs: float = -14.0,
            custom_effects: Dict[str, Any] = None
        ) -> str:
        """
        Advanced tier processing with real-time customizable effects
        
        Args:
            input_file_path: Path to input audio file
            genre: Selected genre for EQ preset
            tier: Processing tier
            target_lufs: Target LUFS value
            custom_effects: Real-time customizable effects
                - compressor: {threshold, ratio, attack, release, enabled}
                - stereo_widener: {width, enabled}
                - loudness: {gain, enabled}
                - limiter: {threshold, ceiling, enabled}
        """
        try:
            logger.info(f"Processing with advanced customizable pipeline for {genre}")
            
            # Load audio
            audio_data, sample_rate = self._load_audio(input_file_path)
            logger.info(f"Loaded audio: {audio_data.shape}, {sample_rate}Hz")
            
            # Get tier configuration
            tier_config = self._get_tier_config(tier)
            
            # Get effective target LUFS (genre-based or custom)
            effective_target_lufs = self._get_effective_target_lufs(genre, target_lufs)
            
            # Start with original audio
            processed_audio = audio_data.copy()
            
            # 1. Apply genre preset EQ (always from genre)
            processed_audio = self._apply_genre_preset_eq(processed_audio, sample_rate, genre)
            logger.info("Step 1: Applied genre preset EQ")
            
            # 2. Customizable Compression
            if custom_effects and custom_effects.get("compressor", {}).get("enabled", True):
                comp_settings = custom_effects["compressor"]
                processed_audio = self._apply_custom_compression(
                    processed_audio, 
                    comp_settings.get("threshold", -16.0),
                    comp_settings.get("ratio", 3.0),
                    comp_settings.get("attack", 0.002),
                    comp_settings.get("release", 0.15)
                )
                logger.info(f"Step 2: Applied custom compression - {comp_settings}")
            else:
                processed_audio = self._apply_standard_compression(processed_audio, sample_rate, tier_config)
                logger.info("Step 2: Applied standard compression")
            
            # 3. Customizable Stereo Widening
            if custom_effects and custom_effects.get("stereo_widener", {}).get("enabled", True):
                stereo_settings = custom_effects["stereo_widener"]
                width = stereo_settings.get("width", 1.5)
                processed_audio = self._apply_custom_stereo_widening(processed_audio, width)
                logger.info(f"Step 3: Applied custom stereo widening - width: {width}")
            elif tier_config["enable_stereo_widening"]:
                processed_audio = self._apply_standard_stereo_widening(processed_audio, tier_config)
                logger.info("Step 3: Applied standard stereo widening")
            
            # 4. Customizable Limiting
            if custom_effects and custom_effects.get("limiter", {}).get("enabled", True):
                limiter_settings = custom_effects["limiter"]
                threshold = limiter_settings.get("threshold", -3.0)
                ceiling = limiter_settings.get("ceiling", -0.1)
                processed_audio = self._apply_custom_limiting(processed_audio, threshold, ceiling)
                logger.info(f"Step 4: Applied custom limiting - threshold: {threshold}, ceiling: {ceiling}")
            else:
                processed_audio = self._apply_standard_limiting(processed_audio, sample_rate)
                logger.info("Step 4: Applied standard limiting")
            
            # 5. Customizable Loudness (before final normalization)
            if custom_effects and custom_effects.get("loudness", {}).get("enabled", True):
                loudness_settings = custom_effects["loudness"]
                gain_db = loudness_settings.get("gain", 0.0)
                processed_audio = self._apply_custom_loudness(processed_audio, gain_db)
                logger.info(f"Step 5: Applied custom loudness - gain: {gain_db} dB")
            
            # 6. Comprehensive Normalization with Brick Wall Limiter (within -7 and -9 pegged)
            processed_audio = self._apply_comprehensive_normalization_with_brick_wall(processed_audio, sample_rate, effective_target_lufs)
            logger.info("Step 6: Applied comprehensive normalization with brick wall limiter")
            
            # 7. Final Loudness Safety Check
            processed_audio = self._apply_final_loudness_safety(processed_audio, sample_rate, effective_target_lufs)
            logger.info("Step 7: Applied final loudness safety check")
            
            # Save processed audio
            output_path = self._save_processed_audio(processed_audio, sample_rate, input_file_path)
            
            logger.info(f"Advanced ML mastering completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Advanced ML mastering failed: {e}")
            raise

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
            logger.info(f"Input file path: {input_file_path}")
            
            # Check if file exists
            if not os.path.exists(input_file_path):
                raise FileNotFoundError(f"Input file not found: {input_file_path}")
            
            # Load audio file (stereo-safe, no librosa)
            logger.info("Loading audio file")
            audio_data, sample_rate = self._load_audio(input_file_path)
            logger.info(f"Audio loaded: shape={audio_data.shape}, sample_rate={sample_rate}")
            
            # audio_data is already (channels, samples) with stereo ensured
            
            # Get genre preset and tier configuration
            preset = self.genre_presets.get(genre, self.genre_presets["Pop"])
            tier_config = self.tier_settings.get(tier, self.tier_settings["Free"])
            
            # Debug logging
            logger.info(f"Available genres: {list(self.genre_presets.keys())}")
            logger.info(f"Requested genre: '{genre}'")
            logger.info(f"Using preset: {preset is not None}")
            if preset is None:
                logger.warning(f"No preset found for genre '{genre}', using Pop preset")
            
            # Use genre-based target LUFS
            effective_target_lufs = target_lufs
            
            logger.info(f"Processing with tier: {tier}, quality: {tier_config['processing_quality']}")
            logger.info(f"Target LUFS: {effective_target_lufs} dB")
            
            # Apply standard processing pipeline
            processed_audio = audio_data.copy()
            
            logger.info(f"Processing with standard pipeline for {genre}")
            
            # 1. Apply genre preset EQ
            processed_audio = self._apply_genre_preset_eq(processed_audio, sample_rate, genre)
            logger.info("Step 1: Applied genre preset EQ")
            
            # 2. Compression
            processed_audio = self._apply_standard_compression(processed_audio, sample_rate, tier_config)
            logger.info("Step 2: Applied compression")
            
            # 3. Stereo Widening (Professional+ tiers only)
            if tier_config["enable_stereo_widening"]:
                processed_audio = self._apply_standard_stereo_widening(processed_audio, tier_config)
                logger.info("Step 3: Applied stereo widening")
            
            # 4. Limiting
            processed_audio = self._apply_standard_limiting(processed_audio, sample_rate)
            logger.info("Step 4: Applied limiting")
            
            # 5. Comprehensive Normalization with Brick Wall Limiter (within -7 and -9 pegged)
            processed_audio = self._apply_comprehensive_normalization_with_brick_wall(processed_audio, sample_rate, effective_target_lufs)
            logger.info("Step 5: Applied comprehensive normalization with brick wall limiter")
            
            # 6. Final Loudness Safety Check
            processed_audio = self._apply_final_loudness_safety(processed_audio, sample_rate, effective_target_lufs)
            logger.info("Step 6: Applied final loudness safety check")
            
            # Save processed audio
            output_path = self._save_processed_audio(processed_audio, sample_rate, input_file_path)
            
            logger.info(f"ML mastering completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"ML mastering failed: {e}")
            raise

    def _apply_genre_preset_eq(self, audio_data: np.ndarray, sample_rate: int, genre: str) -> np.ndarray:
        """Apply ONLY the genre preset EQ - no additional processing"""
        try:
            # Normalize genre name for case-insensitive lookup
            # Handle special characters and common variations
            if not genre:
                normalized_genre = "Pop"
            else:
                # Handle common variations
                genre_lower = genre.lower().strip()
                if genre_lower in ["r-b", "r&b", "rnb", "r and b"]:
                    normalized_genre = "R&B"
                elif genre_lower in ["hip-hop", "hiphop", "hip hop"]:
                    normalized_genre = "Hip Hop"
                elif genre_lower in ["drum-bass", "drum & bass", "dnb"]:
                    normalized_genre = "Drum & Bass"
                else:
                    normalized_genre = genre.title()
            preset = self.genre_presets.get(normalized_genre, self.genre_presets.get("Pop", {}))
            
            # Check if preset has eq_curve
            if not preset or "eq_curve" not in preset:
                logger.warning(f"No EQ curve found for genre {genre} (normalized: {normalized_genre}), using Pop preset")
                preset = self.genre_presets.get("Pop", {})
                if not preset or "eq_curve" not in preset:
                    logger.error("No Pop preset found, returning original audio")
                    return audio_data
            
            eq_curve = preset["eq_curve"]
            
            logger.info(f"Applying genre preset EQ for {genre}")
            
            processed = audio_data.copy()
            
            # Apply low shelf
            if "low_shelf" in eq_curve:
                low_shelf = eq_curve["low_shelf"]
                if low_shelf.get("gain", 0) != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, low_shelf.get("freq", 100), low_shelf.get("gain", 0), "low_shelf")
            
            # Apply low mid
            if "low_mid" in eq_curve:
                low_mid = eq_curve["low_mid"]
                if low_mid.get("gain", 0) != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, low_mid.get("freq", 300), low_mid.get("gain", 0), "peak")
            
            # Apply mid
            if "mid" in eq_curve:
                mid = eq_curve["mid"]
                if mid.get("gain", 0) != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, mid.get("freq", 1000), mid.get("gain", 0), "peak")
            
            # Apply high mid
            if "high_mid" in eq_curve:
                high_mid = eq_curve["high_mid"]
                if high_mid.get("gain", 0) != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, high_mid.get("freq", 4000), high_mid.get("gain", 0), "peak")
            
            # Apply high shelf
            if "high_shelf" in eq_curve:
                high_shelf = eq_curve["high_shelf"]
                if high_shelf.get("gain", 0) != 0:
                    processed = self._apply_simple_eq(processed, sample_rate, high_shelf.get("freq", 8000), high_shelf.get("gain", 0), "high_shelf")
            
            return processed
            
        except Exception as e:
            logger.error(f"Genre preset EQ failed: {e}")
            return audio_data

    def _apply_custom_compression(self, audio_data: np.ndarray, threshold: float, ratio: float, attack: float, release: float) -> np.ndarray:
        """Apply custom compression with user-defined parameters"""
        try:
            logger.info(f"Applying custom compression: threshold={threshold}dB, ratio={ratio}:1, attack={attack}s, release={release}s")
            return self._apply_simple_compression(audio_data, threshold, ratio, attack, release)
        except Exception as e:
            logger.error(f"Custom compression failed: {e}")
            return audio_data

    def _apply_custom_stereo_widening(self, audio_data: np.ndarray, width: float) -> np.ndarray:
        """Apply custom stereo widening with user-defined width"""
        try:
            logger.info(f"Applying custom stereo widening: width={width}x")
            
            if audio_data.ndim != 2 or audio_data.shape[1] != 2:
                logger.warning("Audio is not stereo, skipping stereo widening")
                return audio_data
            
            left, right = audio_data[:, 0], audio_data[:, 1]
            
            # Apply custom width
            if width > 1.0:
                # Stereo widening
                mid = (left + right) / 2
                side = (left - right) / 2
                
                # Apply width scaling
                side_scaled = side * width
                
                # Reconstruct stereo
                left_new = mid + side_scaled
                right_new = mid - side_scaled
                
                # Normalize to prevent clipping
                max_val = max(np.max(np.abs(left_new)), np.max(np.abs(right_new)))
                if max_val > 1.0:
                    left_new = left_new / max_val
                    right_new = right_new / max_val
                
                processed = np.column_stack([left_new, right_new])
            else:
                processed = audio_data
            
            return processed
            
        except Exception as e:
            logger.error(f"Custom stereo widening failed: {e}")
            return audio_data

    def _apply_custom_limiting(self, audio_data: np.ndarray, threshold: float, ceiling: float) -> np.ndarray:
        """Apply custom limiting with user-defined parameters"""
        try:
            logger.info(f"Applying custom limiting: threshold={threshold}dB, ceiling={ceiling}dB")
            
            processed = audio_data.copy()
            
            # Convert dB to linear
            threshold_linear = 10 ** (threshold / 20)
            ceiling_linear = 10 ** (ceiling / 20)
            
            # Apply limiting
            peak = np.max(np.abs(processed))
            if peak > threshold_linear:
                # Calculate gain reduction
                gain_reduction = ceiling_linear / peak
                processed = processed * gain_reduction
                logger.info(f"Custom limiting applied: {20*np.log10(gain_reduction):.1f}dB reduction")
            
            return processed
            
        except Exception as e:
            logger.error(f"Custom limiting failed: {e}")
            return audio_data

    def _apply_custom_loudness(self, audio_data: np.ndarray, gain_db: float) -> np.ndarray:
        """Apply custom loudness adjustment"""
        try:
            logger.info(f"Applying custom loudness: {gain_db} dB")
            
            processed = audio_data.copy()
            
            # Convert dB to linear gain
            gain_linear = 10 ** (gain_db / 20)
            
            # Apply gain
            processed = processed * gain_linear
            
            # Prevent clipping
            peak = np.max(np.abs(processed))
            if peak > 1.0:
                processed = processed / peak
                logger.info(f"Loudness gain applied with peak limiting: {gain_db} dB")
            else:
                logger.info(f"Custom loudness applied: {gain_db} dB")
            
            return processed
            
        except Exception as e:
            logger.error(f"Custom loudness failed: {e}")
            return audio_data

    def _apply_standard_compression(self, audio_data: np.ndarray, sample_rate: int, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply standard compression based on tier"""
        try:
            logger.info("Applying standard compression")
            
            # Standard compression settings based on tier
            if tier_config["processing_quality"] == "basic":
                ratio = 2.0
                threshold = -18.0
                attack = 0.003
                release = 0.2
            elif tier_config["processing_quality"] == "standard":
                ratio = 2.5
                threshold = -16.0
                attack = 0.002
                release = 0.15
            else:  # premium
                ratio = 3.0
                threshold = -14.0
                attack = 0.001
                release = 0.1
            
            return self._apply_simple_compression(audio_data, threshold, ratio, attack, release)
            
        except Exception as e:
            logger.error(f"Standard compression failed: {e}")
            return audio_data

    def _apply_standard_stereo_widening(self, audio_data: np.ndarray, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply enhanced stereo widening for Professional+ tiers"""
        try:
            # For Professional tier we preserve original stereo (no widening)
            if tier_config.get("processing_quality") == "standard":
                return audio_data

            logger.info("Applying enhanced stereo widening")
            
            if audio_data.shape[0] != 2:
                return audio_data  # Only process stereo
            
            processed = audio_data.copy()
            
            # Enhanced stereo width based on tier - much more noticeable
            if tier_config["processing_quality"] == "premium":
                width = 2.2  # 120% widening (was 1.4)
            else:
                # Non-premium should not widen (safety)
                return audio_data
            
            left = processed[0]
            right = processed[1]
            
            # Enhanced mid-side processing with stereo expansion
            mid = (left + right) * 0.5
            side = (left - right) * 0.5
            
            # Apply enhanced width with stereo expansion
            side = side * width
            
            # Convert back to left-right with enhanced stereo image
            new_left = mid + side
            new_right = mid - side
            
            # Apply additional stereo enhancement techniques
            # 1. High-frequency stereo enhancement
            sample_rate = 44100  # Default sample rate
            enhanced_left, enhanced_right = self._apply_stereo_enhancement(new_left, new_right, sample_rate)
            
            processed[0] = enhanced_left
            processed[1] = enhanced_right
            
            logger.info(f"Enhanced stereo widening applied: width={width:.1f}x")
            return processed
            
        except Exception as e:
            logger.error(f"Enhanced stereo widening failed: {e}")
            return audio_data

    def _apply_stereo_enhancement(self, left: np.ndarray, right: np.ndarray, sample_rate: int) -> tuple:
        """Apply additional stereo enhancement techniques"""
        try:
            # 1. High-frequency stereo enhancement
            # Boost stereo information in the 2-8kHz range for better stereo definition
            
            # Simple high-frequency stereo enhancement
            # Apply subtle phase shifting to enhance stereo width
            enhanced_left = left.copy()
            enhanced_right = right.copy()
            
            # Apply gentle stereo enhancement in high frequencies
            # This creates more noticeable stereo expansion
            stereo_enhancement_factor = 0.3  # 30% enhancement
            
            # Create stereo difference signal
            stereo_diff = (left - right) * stereo_enhancement_factor
            
            # Add enhanced stereo information back
            enhanced_left = left + stereo_diff
            enhanced_right = right - stereo_diff
            
            # 2. Apply subtle stereo imaging enhancement
            # Create a wider stereo image by processing the side signal
            side_signal = (enhanced_left - enhanced_right) * 0.5
            mid_signal = (enhanced_left + enhanced_right) * 0.5
            
            # Enhance the side signal for wider stereo image
            enhanced_side = side_signal * 1.5  # 50% side enhancement
            
            # Reconstruct with enhanced stereo width
            final_left = mid_signal + enhanced_side
            final_right = mid_signal - enhanced_side
            
            return final_left, final_right
            
        except Exception as e:
            logger.error(f"Stereo enhancement failed: {e}")
            return left, right


    def _apply_genre_based_stereo_widening(self, audio_data: np.ndarray, genre: str, tier_config: Dict[str, Any]) -> np.ndarray:
        """Apply genre-specific stereo widening with enhanced effects"""
        try:
            logger.info(f"Applying genre-based stereo widening for {genre}")
            
            if audio_data.shape[0] != 2:
                return audio_data  # Only process stereo
            
            processed = audio_data.copy()
            
            # Get genre-specific stereo width from presets
            genre_info = self.get_genre_information()
            preset = genre_info.get(genre, {})
            base_width = preset.get("stereo_width", 1.0)
            
            # Apply tier-based multiplier for enhanced widening
            tier_multiplier = {
                "standard": 1.5,  # 50% additional widening
                "premium": 2.0    # 100% additional widening
            }
            
            tier_quality = tier_config.get("processing_quality", "standard")
            multiplier = tier_multiplier.get(tier_quality, 1.5)
            
            # Calculate final width with genre and tier enhancement
            final_width = base_width * multiplier
            
            # Ensure minimum noticeable widening
            final_width = max(final_width, 1.6)  # Minimum 60% widening
            
            # Cap maximum widening to prevent artifacts
            final_width = min(final_width, 2.5)  # Maximum 150% widening
            
            logger.info(f"Genre {genre}: base_width={base_width:.1f}, final_width={final_width:.1f}")
            
            left = processed[0]
            right = processed[1]
            
            # Enhanced mid-side processing
            mid = (left + right) * 0.5
            side = (left - right) * 0.5
            
            # Apply genre-based width
            side = side * final_width
            
            # Convert back to left-right
            new_left = mid + side
            new_right = mid - side
            
            # Apply genre-specific stereo enhancement
            enhanced_left, enhanced_right = self._apply_genre_stereo_enhancement(new_left, new_right, genre)
            
            processed[0] = enhanced_left
            processed[1] = enhanced_right
            
            logger.info(f"Genre-based stereo widening applied: {final_width:.1f}x for {genre}")
            return processed
            
        except Exception as e:
            logger.error(f"Genre-based stereo widening failed: {e}")
            return audio_data

    def _apply_genre_stereo_enhancement(self, left: np.ndarray, right: np.ndarray, genre: str) -> tuple:
        """Apply genre-specific stereo enhancement techniques"""
        try:
            # Genre-specific stereo enhancement
            enhancement_factors = {
                "Electronic": 0.4,    # High stereo enhancement for electronic music
                "Hip Hop": 0.35,      # Strong stereo for hip hop
                "Pop": 0.3,           # Moderate stereo for pop
                "Rock": 0.25,         # Moderate stereo for rock
                "Afrobeats": 0.4,     # High stereo for afrobeats
                "Amapiano": 0.45,     # Very high stereo for amapiano
                "Trap": 0.4,          # High stereo for trap
                "House": 0.35,        # Strong stereo for house
                "Techno": 0.4,        # High stereo for techno
                "Dubstep": 0.45,      # Very high stereo for dubstep
            }
            
            enhancement_factor = enhancement_factors.get(genre, 0.3)  # Default 30%
            
            # Apply genre-specific stereo enhancement
            stereo_diff = (left - right) * enhancement_factor
            
            # Create enhanced stereo image
            enhanced_left = left + stereo_diff
            enhanced_right = right - stereo_diff
            
            # Additional stereo imaging for certain genres
            if genre in ["Electronic", "Amapiano", "Dubstep", "Techno"]:
                # Extra stereo enhancement for electronic genres
                side_signal = (enhanced_left - enhanced_right) * 0.5
                mid_signal = (enhanced_left + enhanced_right) * 0.5
                
                # Extra side enhancement for electronic music
                enhanced_side = side_signal * 1.8  # 80% side enhancement
                
                final_left = mid_signal + enhanced_side
                final_right = mid_signal - enhanced_side
                
                return final_left, final_right
            
            return enhanced_left, enhanced_right
            
        except Exception as e:
            logger.error(f"Genre stereo enhancement failed: {e}")
            return left, right

    def _apply_standard_limiting(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """Apply standard limiting to prevent clipping"""
        try:
            logger.info("Applying standard limiting")
            
            processed = audio_data.copy()
            
            # Standard limiting threshold
            max_level = 0.95  # -0.4 dB
            
            peak = np.max(np.abs(processed))
            
            if peak > max_level:
                gain_reduction = max_level / peak
                processed = processed * gain_reduction
                logger.info(f"Applied limiting: {20*np.log10(gain_reduction):.1f}dB reduction")
            
            return processed
            
        except Exception as e:
            logger.error(f"Standard limiting failed: {e}")
            return audio_data

    def _apply_comprehensive_normalization_with_brick_wall(self, audio_data: np.ndarray, sample_rate: int, target_lufs: float) -> np.ndarray:
        """Apply comprehensive normalization with brick wall limiter (pegged within -7 to -9 LUFS)"""
        try:
            logger.info(f"Applying comprehensive normalization with brick wall limiter (LUFS range: -7 to -9)")
            
            processed = audio_data.copy()
            
            # Calculate current LUFS (simplified)
            rms = np.sqrt(np.mean(processed ** 2))
            current_lufs = 20 * np.log10(rms + 1e-10)
            
            logger.info(f"Current LUFS: {current_lufs:.2f} dB, Target: {target_lufs:.2f} dB")
            
            # FORCE all audio to be pegged within -7 to -9 LUFS range (increased volume)
            # If current LUFS is lower than -9, boost it to -9
            # If current LUFS is higher than -7, reduce it to -7
            # If current LUFS is between -9 and -7, use the target if it's within range
            
            if current_lufs < -9.0:
                # Too quiet - boost to -9 LUFS (louder than before)
                effective_target = -9.0
                logger.info(f"Audio too quiet ({current_lufs:.2f} dB), boosting to -9.0 dB")
            elif current_lufs > -7.0:
                # Too loud - reduce to -7 LUFS (louder than before)
                effective_target = -7.0
                logger.info(f"Audio too loud ({current_lufs:.2f} dB), reducing to -7.0 dB")
            else:
                # Within range - use target if it's also within range, otherwise clamp it
                if target_lufs < -9.0:
                    effective_target = -9.0
                    logger.info(f"Target too quiet ({target_lufs:.2f} dB), clamping to -9.0 dB")
                elif target_lufs > -7.0:
                    effective_target = -7.0
                    logger.info(f"Target too loud ({target_lufs:.2f} dB), clamping to -7.0 dB")
                else:
                    effective_target = target_lufs
                    logger.info(f"Using target LUFS: {target_lufs:.2f} dB")
            
            # Calculate gain needed to reach effective target
            gain_db = effective_target - current_lufs
            gain_linear = 10 ** (gain_db / 20)
            
            # Apply gain
            processed = processed * gain_linear
            
            # Verify the result is within range
            new_rms = np.sqrt(np.mean(processed ** 2))
            new_lufs = 20 * np.log10(new_rms + 1e-10)
            logger.info(f"After gain adjustment: {new_lufs:.2f} dB")
            
            # Apply brick wall limiting to prevent any clipping
            max_level = 0.99  # Brick wall at -0.1 dB
            peak = np.max(np.abs(processed))
            
            if peak > max_level:
                # Hard limiting - no soft knee
                gain_reduction = max_level / peak
                processed = processed * gain_reduction
                logger.info(f"Brick wall limiting applied: {20*np.log10(gain_reduction):.1f}dB reduction")
                
                # Recalculate LUFS after limiting
                final_rms = np.sqrt(np.mean(processed ** 2))
                final_lufs = 20 * np.log10(final_rms + 1e-10)
                logger.info(f"Final LUFS after limiting: {final_lufs:.2f} dB")
            
            # Final verification - ensure we're still within the -7 to -9 range
            final_rms = np.sqrt(np.mean(processed ** 2))
            final_lufs = 20 * np.log10(final_rms + 1e-10)
            
            if final_lufs < -9.0 or final_lufs > -7.0:
                logger.warning(f"Final LUFS ({final_lufs:.2f} dB) is outside target range (-7 to -9 dB)")
                # Apply final correction if needed
                if final_lufs < -9.0:
                    correction_gain = 10 ** ((-9.0 - final_lufs) / 20)
                    processed = processed * correction_gain
                    logger.info(f"Applied final boost to reach -9.0 dB")
                elif final_lufs > -7.0:
                    correction_gain = 10 ** ((-7.0 - final_lufs) / 20)
                    processed = processed * correction_gain
                    logger.info(f"Applied final reduction to reach -7.0 dB")
            
            logger.info(f"Comprehensive normalization completed - Final LUFS: {20*np.log10(np.sqrt(np.mean(processed ** 2)) + 1e-10):.2f} dB")
            return processed
            
        except Exception as e:
            logger.error(f"Comprehensive normalization failed: {e}")
            return audio_data

    def _apply_final_loudness_safety(self, audio_data: np.ndarray, sample_rate: int, target_lufs: float) -> np.ndarray:
        """Apply final loudness safety check (enforce -7 to -9 LUFS range)"""
        try:
            logger.info("Applying final loudness safety check (LUFS range: -7 to -9)")
            
            processed = audio_data.copy()
            
            # Enforce strict LUFS range: -7 to -9 dB (increased volume)
            min_safe_lufs = -9.0   # Minimum LUFS (louder)
            max_safe_lufs = -7.0   # Maximum LUFS (louder)
            max_safe_peak = 0.989  # Maximum safe peak (-0.1 dB)
            
            # Check current LUFS
            rms = np.sqrt(np.mean(processed ** 2))
            current_lufs = 20 * np.log10(rms + 1e-10)
            
            logger.info(f"Final safety check - Current LUFS: {current_lufs:.2f} dB")
            
            # Enforce LUFS range
            if current_lufs < min_safe_lufs:
                # Too quiet - boost to minimum
                lufs_gain_db = min_safe_lufs - current_lufs
                lufs_gain_linear = 10 ** (lufs_gain_db / 20)
                processed = processed * lufs_gain_linear
                logger.info(f"LUFS safety boost: {current_lufs:.2f} → {min_safe_lufs:.2f} dB")
            elif current_lufs > max_safe_lufs:
                # Too loud - reduce to maximum
                lufs_gain_db = max_safe_lufs - current_lufs
                lufs_gain_linear = 10 ** (lufs_gain_db / 20)
                processed = processed * lufs_gain_linear
                logger.info(f"LUFS safety reduction: {current_lufs:.2f} → {max_safe_lufs:.2f} dB")
            else:
                logger.info(f"LUFS within safe range: {current_lufs:.2f} dB")
            
            # Check peak safety
            peak = np.max(np.abs(processed))
            if peak > max_safe_peak:
                peak_gain = max_safe_peak / peak
                processed = processed * peak_gain
                logger.info(f"Peak safety applied: {peak:.3f} → {max_safe_peak:.3f}")
                
                # Recalculate LUFS after peak limiting
                final_rms = np.sqrt(np.mean(processed ** 2))
                final_lufs = 20 * np.log10(final_rms + 1e-10)
                logger.info(f"LUFS after peak limiting: {final_lufs:.2f} dB")
            
            # Final verification
            final_rms = np.sqrt(np.mean(processed ** 2))
            final_lufs = 20 * np.log10(final_rms + 1e-10)
            final_peak = np.max(np.abs(processed))
            
            logger.info(f"Final safety check complete - LUFS: {final_lufs:.2f} dB, Peak: {final_peak:.3f}")
            
            return processed
            
        except Exception as e:
            logger.error(f"Final loudness safety failed: {e}")
            return audio_data

    def _apply_simple_compression(self, audio_data: np.ndarray, threshold: float, ratio: float, attack: float, release: float) -> np.ndarray:
        """Apply simple compression"""
        try:
            processed = audio_data.copy()
            
            # Convert to linear values
            threshold_linear = 10 ** (threshold / 20)
            
            # Simple compression implementation
            for channel in range(processed.shape[0]):
                channel_data = processed[channel]
                compressed = np.zeros_like(channel_data)
                
                # Simple envelope follower
                envelope = 0.0
                for i, sample in enumerate(channel_data):
                    # Attack/release envelope
                    if abs(sample) > envelope:
                        envelope += (abs(sample) - envelope) * (1 - np.exp(-1 / (attack * 44100)))
                    else:
                        envelope += (abs(sample) - envelope) * (1 - np.exp(-1 / (release * 44100)))
                    
                    # Apply compression
                    if envelope > threshold_linear:
                        gain_reduction = 1 - (1 - threshold_linear / envelope) * (1 - 1/ratio)
                        compressed[i] = sample * gain_reduction
                    else:
                        compressed[i] = sample
                
                processed[channel] = compressed
            
            return processed
            
        except Exception as e:
            logger.error(f"Simple compression failed: {e}")
            return audio_data

    def _apply_simple_eq(self, audio_data: np.ndarray, sample_rate: int, freq: float, gain: float, eq_type: str) -> np.ndarray:
        """Apply simple EQ filter"""
        try:
            processed = audio_data.copy()
            
            # Simple EQ implementation using numpy
            if eq_type == "low_shelf":
                # Low shelf filter
                for channel in range(processed.shape[0]):
                    # Simple low shelf approximation
                    if gain > 0:
                        # Boost low frequencies
                        low_freq_mask = np.arange(len(processed[channel])) < len(processed[channel]) * (freq / (sample_rate / 2))
                        processed[channel][low_freq_mask] *= (1 + gain / 10)
                    else:
                        # Cut low frequencies
                        low_freq_mask = np.arange(len(processed[channel])) < len(processed[channel]) * (freq / (sample_rate / 2))
                        processed[channel][low_freq_mask] *= (1 + gain / 10)
            
            elif eq_type == "high_shelf":
                # High shelf filter
                for channel in range(processed.shape[0]):
                    # Simple high shelf approximation
                    if gain > 0:
                        # Boost high frequencies
                        high_freq_mask = np.arange(len(processed[channel])) > len(processed[channel]) * (freq / (sample_rate / 2))
                        processed[channel][high_freq_mask] *= (1 + gain / 10)
                    else:
                        # Cut high frequencies
                        high_freq_mask = np.arange(len(processed[channel])) > len(processed[channel]) * (freq / (sample_rate / 2))
                        processed[channel][high_freq_mask] *= (1 + gain / 10)
            
            elif eq_type == "peak":
                # Peak filter
                for channel in range(processed.shape[0]):
                    # Simple peak filter approximation
                    center_freq_mask = np.abs(np.arange(len(processed[channel])) - len(processed[channel]) * (freq / (sample_rate / 2))) < len(processed[channel]) * 0.1
                    processed[channel][center_freq_mask] *= (1 + gain / 10)
            
            return processed
            
        except Exception as e:
            logger.error(f"Simple EQ failed: {e}")
            return audio_data

    def _save_processed_audio(self, audio_data: np.ndarray, sample_rate: int, input_file_path: str) -> str:
        """Save processed audio to temporary file"""
        try:
            # Create output filename
            input_path = Path(input_file_path)
            output_filename = f"processed_{input_path.stem}.wav"
            output_path = os.path.join(self.temp_dir, output_filename)
            
            # Save audio
            sf.write(output_path, audio_data.T, sample_rate)
            
            logger.info(f"Processed audio saved: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to save processed audio: {e}")
            return input_file_path

    def get_tier_information(self) -> Dict[str, Any]:
        """Get tier-specific processing information"""
        try:
            return {
                "tiers": self.tier_settings,
                "available_genres": list(self.genre_presets.keys())
            }
        except Exception as e:
            logger.error(f"Failed to get tier information: {e}")
            return {}

    def get_genre_information(self) -> Dict[str, Any]:
        """Get genre-specific processing information"""
        try:
            genre_info = {}
            for genre, preset in self.genre_presets.items():
                # Provide default values for missing fields
                default_compression = {"ratio": 2.0, "threshold": -18.0, "attack": 0.01, "release": 0.25}
                default_stereo_width = 1.0
                default_target_lufs = -14.0
                
                # Genre-specific defaults based on genre type
                if genre in ["Afrobeats", "Amapiano", "Kwaito", "Gqom"]:
                    default_compression = {"ratio": 2.5, "threshold": -16.0, "attack": 0.002, "release": 0.15}
                    default_stereo_width = 1.2
                    default_target_lufs = -10.0
                elif genre in ["Hip Hop", "R&B", "Pop"]:
                    default_compression = {"ratio": 2.2, "threshold": -17.0, "attack": 0.003, "release": 0.2}
                    default_stereo_width = 1.1
                    default_target_lufs = -12.0
                elif genre in ["Rock", "Electronic"]:
                    default_compression = {"ratio": 3.0, "threshold": -14.0, "attack": 0.001, "release": 0.1}
                    default_stereo_width = 1.3
                    default_target_lufs = -8.0
                
                genre_info[genre] = {
                    "eq_curve": preset["eq_curve"],
                    "compression": preset.get("compression", default_compression),
                    "stereo_width": preset.get("stereo_width", default_stereo_width),
                    "target_lufs": preset.get("target_lufs", default_target_lufs)
                }
            return genre_info
            
        except Exception as e:
            logger.error(f"Failed to get genre information: {e}")
            return {}
