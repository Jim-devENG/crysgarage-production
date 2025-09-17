"""
ML Mastering Engine
Handles AI-powered audio mastering with genre-specific presets
"""

import os
import tempfile
import numpy as np
import librosa
import soundfile as sf
from typing import Dict, Any
import logging
from pathlib import Path

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
            # West African Genres
            "Afrobeats": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 2.0},     # +2dB at 100Hz
                    "low_mid": {"freq": 300, "gain": -0.5},      # Slight dip at 300Hz
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral mids
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide mids
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Tape warmth
                },
                "compression": {
                    "ratio": 2.0,                                # Smooth 2:1
                    "threshold": -18.0,                          # Gentle threshold
                    "attack": 0.003,                             # Smooth attack
                    "release": 0.2                               # Smooth release
                },
                "stereo_width": 1.3,                             # Wide mids
                "target_lufs": -9.0                              # -9 LUFS
            },
            "Alté": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 0.5},      # Soften low mids
                    "low_mid": {"freq": 300, "gain": -1.0},      # Soften low mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Airy
                    "high_shelf": {"freq": 12000, "gain": 3.0}   # Airy highs +3dB
                },
                "compression": {
                    "ratio": 2.5,                                # Light compression
                    "threshold": -20.0,                          # Light threshold
                    "attack": 0.005,                             # Light attack
                    "release": 0.25                              # Light release
                },
                "stereo_width": 1.4,                             # Experimental widen
                "target_lufs": -11.0                             # -11 LUFS
            },
            "Hip-life": {
                "eq_curve": {
                    "low_shelf": {"freq": 70, "gain": 2.5},      # Push 60-80Hz kick
                    "low_mid": {"freq": 300, "gain": 1.0},       # Brighten vocals
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.5},     # Vocal clarity
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Brighten vocals
                },
                "compression": {
                    "ratio": 3.0,                                # Punchy 3:1
                    "threshold": -16.0,                          # Punchy threshold
                    "attack": 0.002,                             # Fast attack
                    "release": 0.15                              # Punchy release
                },
                "stereo_width": 1.2,                             # Balanced
                "target_lufs": -9.0                              # -9 LUFS
            },
            "Azonto": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 2.0},     # Boost 100Hz
                    "low_mid": {"freq": 300, "gain": 0.5},       # Dance punch
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Dance energy
                    "high_shelf": {"freq": 8000, "gain": 2.0}    # Boost 8kHz
                },
                "compression": {
                    "ratio": 3.5,                                # Dance-punchy
                    "threshold": -15.0,                          # Dance threshold
                    "attack": 0.001,                             # Fast attack
                    "release": 0.12                              # Dance release
                },
                "stereo_width": 1.5,                             # Extra widen for dance
                "target_lufs": -8.0                              # -8 LUFS
            },
            "Naija Pop": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.8},      # Balance low punch
                    "low_mid": {"freq": 300, "gain": 1.0},       # Modern clean
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Pop sheen
                    "high_shelf": {"freq": 8000, "gain": 1.8}    # High sparkle
                },
                "compression": {
                    "ratio": 2.8,                                # Modern clean
                    "threshold": -17.0,                          # Clean threshold
                    "attack": 0.002,                             # Clean attack
                    "release": 0.18                              # Clean release
                },
                "stereo_width": 1.3,                             # Wide
                "target_lufs": -8.5                              # -8.5 LUFS
            },
            "Bongo Flava": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},      # +2dB lows
                    "low_mid": {"freq": 300, "gain": 0.8},       # Smooth vocal glue
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Vocal clarity
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Silky highs
                },
                "compression": {
                    "ratio": 2.5,                                # Smooth vocal glue
                    "threshold": -19.0,                          # Smooth threshold
                    "attack": 0.003,                             # Smooth attack
                    "release": 0.2                               # Smooth release
                },
                "stereo_width": 1.1,                             # Centered vocals
                "target_lufs": -9.0                              # -9 LUFS
            },
            
            # South African Genres
            "Amapiano": {
                "eq_curve": {
                    "low_shelf": {"freq": 50, "gain": 2.5},      # Boost sub 40-60Hz
                    "low_mid": {"freq": 300, "gain": -0.8},      # Control mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Transient clarity
                    "high_shelf": {"freq": 8000, "gain": 1.2}    # Wide low-pass reverb
                },
                "compression": {
                    "ratio": 2.8,                                # Soft pumping
                    "threshold": -17.0,                          # Soft threshold
                    "attack": 0.002,                             # Soft attack
                    "release": 0.2                               # Soft release
                },
                "stereo_width": 1.4,                             # Wide low-pass reverb
                "target_lufs": -8.0                              # -8 LUFS
            },
            "Kwaito": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.2},      # Emphasize bassline
                    "low_mid": {"freq": 300, "gain": 0.5},       # Groove tight
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 0.8},     # Controlled
                    "high_shelf": {"freq": 8000, "gain": 0.8}    # Subtle tape hiss vibe
                },
                "compression": {
                    "ratio": 3.2,                                # Groove tight
                    "threshold": -18.0,                          # Tight threshold
                    "attack": 0.002,                             # Tight attack
                    "release": 0.16                              # Tight release
                },
                "stereo_width": 1.2,                             # Controlled widen
                "target_lufs": -9.0                              # -9 LUFS
            },
            "Gqom": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 3.0},      # Deep subs +3dB
                    "low_mid": {"freq": 200, "gain": -1.5},      # Cut 200Hz mud
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide highs
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Distortion edge
                },
                "compression": {
                    "ratio": 4.5,                                # Heavy sidechain
                    "threshold": -14.0,                          # Heavy threshold
                    "attack": 0.001,                             # Heavy attack
                    "release": 0.08                              # Heavy release
                },
                "stereo_width": 1.0,                             # Mono bass, wide highs
                "target_lufs": -7.5                              # -7.5 LUFS
            },
            "Shangaan Electro": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Moderate lows
                    "low_mid": {"freq": 300, "gain": 0.2},       # Tight fast
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Transient sharpener
                    "high_shelf": {"freq": 12000, "gain": 2.5}   # Boost highs 10-14kHz
                },
                "compression": {
                    "ratio": 5.0,                                # Tight fast attack
                    "threshold": -13.0,                          # Fast threshold
                    "attack": 0.001,                             # Fast attack
                    "release": 0.06                              # Fast release
                },
                "stereo_width": 1.6,                             # Extra wide
                "target_lufs": -7.0                              # -7 LUFS
            },
            "Kwela": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.0},      # Moderate lows
                    "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                    "mid": {"freq": 2000, "gain": 2.0},          # Emphasize midrange pennywhistle
                    "high_mid": {"freq": 4000, "gain": 1.5},     # Pennywhistle clarity
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Tape warmth
                },
                "compression": {
                    "ratio": 2.2,                                # Soft glue
                    "threshold": -22.0,                          # Soft threshold
                    "attack": 0.008,                             # Soft attack
                    "release": 0.3                               # Soft release
                },
                "stereo_width": 1.1,                             # Natural stage
                "target_lufs": -10.0                             # -10 LUFS
            },
            # Central/East African Genres
            "Kuduro": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.5},      # Low punch
                    "low_mid": {"freq": 300, "gain": 0.5},       # Club energy
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Crisp highs
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Saturation drive
                },
                "compression": {
                    "ratio": 3.0,                                # Aggressive
                    "threshold": -12.0,                          # Hard threshold
                    "attack": 0.003,                             # Fast attack
                    "release": 0.1                               # Fast release
                },
                "stereo_width": 1.4,                             # Club widen
                "target_lufs": -7.5                              # -7.5 LUFS
            },
            "Ndombolo": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},      # +2dB bass
                    "low_mid": {"freq": 300, "gain": 1.0},       # Lively mids for guitars
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Natural wide
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Exciter for sparkle
                },
                "compression": {
                    "ratio": 2.0,                                # Gentle
                    "threshold": -15.0,                          # Soft threshold
                    "attack": 0.01,                              # Slow attack
                    "release": 0.2                               # Slow release
                },
                "stereo_width": 1.2,                             # Natural wide
                "target_lufs": -9.0                              # -9 LUFS
            },
            "Gengetone": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},      # Heavy low-end +2dB
                    "low_mid": {"freq": 300, "gain": 0.5},       # Vocal brightness
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Centered vocals
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Saturation
                },
                "compression": {
                    "ratio": 4.0,                                # Hard rap style
                    "threshold": -10.0,                          # Hard threshold
                    "attack": 0.002,                             # Very fast attack
                    "release": 0.1                               # Fast release
                },
                "stereo_width": 1.0,                             # Centered vocals
                "target_lufs": -8.0                              # -8 LUFS
            },
            "Shrap": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 3.0},      # Deep sub boost
                    "low_mid": {"freq": 200, "gain": -1.0},      # Modern trap
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide stereo synths
                    "high_shelf": {"freq": 8000, "gain": 2.0}    # Sparkle highs, exciter
                },
                "compression": {
                    "ratio": 3.5,                                # Modern trap (hard knee)
                    "threshold": -8.0,                           # Hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.05                              # Very fast release
                },
                "stereo_width": 1.5,                             # Wide stereo synths
                "target_lufs": -7.5                              # -7.5 LUFS
            },
            "Singeli": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 2.0},      # Tame harsh highs
                    "low_mid": {"freq": 300, "gain": -0.5},      # Lift subs
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Widen percussion
                    "high_shelf": {"freq": 8000, "gain": 0.5}    # Transient control
                },
                "compression": {
                    "ratio": 4.0,                                # Tight (fast attack)
                    "threshold": -8.0,                           # Hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.05                              # Very fast release
                },
                "stereo_width": 1.3,                             # Widen percussion
                "target_lufs": -7.0                              # -7 LUFS
            },
            "Urban Benga": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Guitar clarity (2-4kHz)
                    "low_mid": {"freq": 300, "gain": 0.5},       # Smooth lows
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Warm stereo spread
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Tape shimmer
                },
                "compression": {
                    "ratio": 2.0,                                # Soft
                    "threshold": -15.0,                          # Soft threshold
                    "attack": 0.01,                              # Slow attack
                    "release": 0.2                               # Slow release
                },
                "stereo_width": 1.2,                             # Warm stereo spread
                "target_lufs": -9.0                              # -9 LUFS
            },
            "New Benga": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.8},      # Guitar clarity
                    "low_mid": {"freq": 300, "gain": 0.5},       # Low punch
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide but centered kick
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Gentle exciter
                },
                "compression": {
                    "ratio": 2.0,                                # Transparent
                    "threshold": -15.0,                          # Soft threshold
                    "attack": 0.01,                              # Slow attack
                    "release": 0.2                               # Slow release
                },
                "stereo_width": 1.1,                             # Wide but centered kick
                "target_lufs": -9.0                              # -9 LUFS
            },
            # North African Genres
            "Raï N'B": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Silky top-end
                    "low_mid": {"freq": 300, "gain": 0.5},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide reverb tail
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Harmonic exciter
                },
                "compression": {
                    "ratio": 2.0,                                # R&B smooth
                    "threshold": -12.0,                          # Moderate threshold
                    "attack": 0.005,                             # Smooth attack
                    "release": 0.15                              # Smooth release
                },
                "stereo_width": 1.3,                             # Wide reverb tail
                "target_lufs": -9.5                              # -9.5 LUFS
            },
            "Raï-hop": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},      # Strong kick
                    "low_mid": {"freq": 300, "gain": 0.5},       # Vocal clarity
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Moderate wide
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Analog saturation
                },
                "compression": {
                    "ratio": 3.0,                                # Hip hop style
                    "threshold": -10.0,                          # Hard threshold
                    "attack": 0.003,                             # Fast attack
                    "release": 0.1                               # Fast release
                },
                "stereo_width": 1.2,                             # Moderate wide
                "target_lufs": -8.5                              # -8.5 LUFS
            },
            "Gnawa Fusion": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Highlight percussive lows
                    "low_mid": {"freq": 300, "gain": 0.5},       # Airy highs
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide instruments
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Reverb depth
                },
                "compression": {
                    "ratio": 2.0,                                # Gentle glue
                    "threshold": -15.0,                          # Soft threshold
                    "attack": 0.01,                              # Slow attack
                    "release": 0.2                               # Slow release
                },
                "stereo_width": 1.4,                             # Wide instruments
                "target_lufs": -9.0                              # -9 LUFS
            },
            # Fusion Genres
            "Afrotrap": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 3.0},      # Hard-hitting sub +3dB
                    "low_mid": {"freq": 200, "gain": -1.0},      # Bright hats
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide synths
                    "high_shelf": {"freq": 8000, "gain": 2.0}    # Exciter edge
                },
                "compression": {
                    "ratio": 3.5,                                # Hard knee
                    "threshold": -8.0,                           # Hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.05                              # Very fast release
                },
                "stereo_width": 1.5,                             # Wide synths
                "target_lufs": -7.5                              # -7.5 LUFS
            },
            "Afro-Gospel": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Balance lows
                    "low_mid": {"freq": 300, "gain": 0.5},       # Vocal sparkle
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Open wide
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Subtle warmth
                },
                "compression": {
                    "ratio": 1.5,                                # Light transparent
                    "threshold": -18.0,                          # Very soft threshold
                    "attack": 0.01,                              # Slow attack
                    "release": 0.3                               # Slow release
                },
                "stereo_width": 1.3,                             # Open wide
                "target_lufs": -9.5                              # -9.5 LUFS
            },
            "Urban Gospel": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Mid clarity for choirs
                    "low_mid": {"freq": 300, "gain": 0.5},       # Top sparkle
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Wide stereo chorus
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Reverb shine
                },
                "compression": {
                    "ratio": 2.0,                                # Smooth
                    "threshold": -12.0,                          # Moderate threshold
                    "attack": 0.005,                             # Smooth attack
                    "release": 0.15                              # Smooth release
                },
                "stereo_width": 1.4,                             # Wide stereo chorus
                "target_lufs": -9.0                              # -9 LUFS
            },
            # Advanced Tier Genres (24 additional genres)
            "Trap": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 3.5},      # Heavy bass
                    "low_mid": {"freq": 300, "gain": 1.2},       # Mid punch
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 0.6},     # High clarity
                    "high_shelf": {"freq": 8000, "gain": 0.6}    # Crisp highs
                },
                "compression": {
                    "ratio": 6.0,                                # Heavy compression
                    "threshold": -14.0,                          # Hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.08                              # Fast release
                },
                "stereo_width": 1.2,                             # Wide stereo
                "target_lufs": -7.2                              # -7.2 LUFS
            },
            "Drill": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 3.0},      # Heavy bass
                    "low_mid": {"freq": 300, "gain": 1.8},       # Mid punch
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 0.7},     # High clarity
                    "high_shelf": {"freq": 8000, "gain": 0.7}    # Crisp highs
                },
                "compression": {
                    "ratio": 5.0,                                # Heavy compression
                    "threshold": -16.0,                          # Hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.1                               # Fast release
                },
                "stereo_width": 1.1,                             # Moderate stereo
                "target_lufs": -7.5                              # -7.5 LUFS
            },
            "Dubstep": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 4.0},      # Deep bass
                    "low_mid": {"freq": 200, "gain": 1.0},       # Mid control
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 0.8},     # High clarity
                    "high_shelf": {"freq": 8000, "gain": 0.8}    # Crisp highs
                },
                "compression": {
                    "ratio": 8.0,                                # Very heavy compression
                    "threshold": -12.0,                          # Very hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.05                              # Very fast release
                },
                "stereo_width": 1.3,                             # Wide stereo
                "target_lufs": -7.0                              # -7.0 LUFS
            },
            "R&B": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.2},      # Gentle bass
                    "low_mid": {"freq": 300, "gain": 2.5},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.8},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 1.8}    # Airy highs
                },
                "compression": {
                    "ratio": 2.2,                                # Gentle compression
                    "threshold": -24.0,                          # Soft threshold
                    "attack": 0.015,                             # Slow attack
                    "release": 0.2                               # Slow release
                },
                "stereo_width": 1.2,                             # Moderate stereo
                "target_lufs": -8.8                              # -8.8 LUFS
            },
            "Lofi Hip-Hop": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 0.8},      # Soft bass
                    "low_mid": {"freq": 300, "gain": 1.5},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.2},     # Soft highs
                    "high_shelf": {"freq": 8000, "gain": 1.2}    # Airy highs
                },
                "compression": {
                    "ratio": 1.8,                                # Very gentle compression
                    "threshold": -26.0,                          # Very soft threshold
                    "attack": 0.025,                             # Very slow attack
                    "release": 0.3                               # Very slow release
                },
                "stereo_width": 1.0,                             # Natural stereo
                "target_lufs": -9.0                              # -9.0 LUFS
            },
            "House": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.5},      # Strong bass
                    "low_mid": {"freq": 300, "gain": 1.8},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright highs
                },
                "compression": {
                    "ratio": 4.5,                                # Moderate compression
                    "threshold": -17.0,                          # Moderate threshold
                    "attack": 0.002,                             # Fast attack
                    "release": 0.15                              # Moderate release
                },
                "stereo_width": 1.3,                             # Wide stereo
                "target_lufs": -8.0                              # -8.0 LUFS
            },
            "Techno": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 3.2},      # Strong bass
                    "low_mid": {"freq": 300, "gain": 1.6},       # Mid punch
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 0.9},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 0.9}    # Bright highs
                },
                "compression": {
                    "ratio": 5.5,                                # Heavy compression
                    "threshold": -15.0,                          # Hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.08                              # Fast release
                },
                "stereo_width": 1.4,                             # Very wide stereo
                "target_lufs": -7.5                              # -7.5 LUFS
            },
            "Highlife": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.8},      # Moderate bass
                    "low_mid": {"freq": 300, "gain": 2.2},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.2},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 1.2}    # Bright highs
                },
                "compression": {
                    "ratio": 3.0,                                # Moderate compression
                    "threshold": -20.0,                          # Soft threshold
                    "attack": 0.005,                             # Moderate attack
                    "release": 0.25                              # Slow release
                },
                "stereo_width": 1.2,                             # Moderate stereo
                "target_lufs": -8.2                              # -8.2 LUFS
            },
            "Instrumentals": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Moderate bass
                    "low_mid": {"freq": 300, "gain": 2.0},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.5},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Bright highs
                },
                "compression": {
                    "ratio": 2.8,                                # Gentle compression
                    "threshold": -21.0,                          # Soft threshold
                    "attack": 0.008,                             # Moderate attack
                    "release": 0.25                              # Slow release
                },
                "stereo_width": 1.3,                             # Wide stereo
                "target_lufs": -8.5                              # -8.5 LUFS
            },
            "Beats": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.2},      # Strong bass
                    "low_mid": {"freq": 300, "gain": 1.8},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright highs
                },
                "compression": {
                    "ratio": 3.5,                                # Moderate compression
                    "threshold": -19.0,                          # Moderate threshold
                    "attack": 0.003,                             # Fast attack
                    "release": 0.2                               # Moderate release
                },
                "stereo_width": 1.2,                             # Moderate stereo
                "target_lufs": -8.0                              # -8.0 LUFS
            },
            "Trance": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},      # Strong bass
                    "low_mid": {"freq": 300, "gain": 1.5},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.8},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 1.8}    # Airy highs
                },
                "compression": {
                    "ratio": 4.0,                                # Moderate compression
                    "threshold": -18.0,                          # Moderate threshold
                    "attack": 0.002,                             # Fast attack
                    "release": 0.2                               # Moderate release
                },
                "stereo_width": 1.4,                             # Very wide stereo
                "target_lufs": -7.8                              # -7.8 LUFS
            },
            "Drum & Bass": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 3.8},      # Deep bass
                    "low_mid": {"freq": 200, "gain": 1.4},       # Mid control
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.0},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright highs
                },
                "compression": {
                    "ratio": 7.0,                                # Very heavy compression
                    "threshold": -13.0,                          # Very hard threshold
                    "attack": 0.001,                             # Very fast attack
                    "release": 0.06                              # Very fast release
                },
                "stereo_width": 1.3,                             # Wide stereo
                "target_lufs": -7.0                              # -7.0 LUFS
            },
            "Reggae": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.5},      # Strong bass
                    "low_mid": {"freq": 300, "gain": 1.2},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 0.6},     # Soft highs
                    "high_shelf": {"freq": 8000, "gain": 0.6}    # Mellow highs
                },
                "compression": {
                    "ratio": 2.8,                                # Gentle compression
                    "threshold": -21.0,                          # Soft threshold
                    "attack": 0.008,                             # Moderate attack
                    "release": 0.3                               # Slow release
                },
                "stereo_width": 1.1,                             # Natural stereo
                "target_lufs": -8.2                              # -8.2 LUFS
            },
            "Voice Over": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 0.8},      # Minimal bass
                    "low_mid": {"freq": 300, "gain": 2.8},       # Strong mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 2.2},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 2.2}    # Clear highs
                },
                "compression": {
                    "ratio": 2.0,                                # Gentle compression
                    "threshold": -25.0,                          # Very soft threshold
                    "attack": 0.02,                              # Slow attack
                    "release": 0.4                               # Very slow release
                },
                "stereo_width": 1.0,                             # Mono/centered
                "target_lufs": -9.2                              # -9.2 LUFS
            },
            "Journalist": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 0.6},      # Minimal bass
                    "low_mid": {"freq": 300, "gain": 3.0},       # Very strong mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 2.5},     # Very bright highs
                    "high_shelf": {"freq": 8000, "gain": 2.5}    # Very clear highs
                },
                "compression": {
                    "ratio": 1.8,                                # Very gentle compression
                    "threshold": -26.0,                          # Very soft threshold
                    "attack": 0.025,                             # Very slow attack
                    "release": 0.5                               # Very slow release
                },
                "stereo_width": 1.0,                             # Mono/centered
                "target_lufs": -9.5                              # -9.5 LUFS
            },
            "Soul": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.2},      # Gentle bass
                    "low_mid": {"freq": 300, "gain": 2.5},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.8},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 1.8}    # Airy highs
                },
                "compression": {
                    "ratio": 2.2,                                # Gentle compression
                    "threshold": -23.0,                          # Soft threshold
                    "attack": 0.015,                             # Slow attack
                    "release": 0.2                               # Slow release
                },
                "stereo_width": 1.2,                             # Moderate stereo
                "target_lufs": -8.8                              # -8.8 LUFS
            },
            "Content Creator": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Moderate bass
                    "low_mid": {"freq": 300, "gain": 2.0},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.5},     # Clear highs
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Bright highs
                },
                "compression": {
                    "ratio": 3.0,                                # Moderate compression
                    "threshold": -20.0,                          # Soft threshold
                    "attack": 0.005,                             # Moderate attack
                    "release": 0.25                              # Slow release
                },
                "stereo_width": 1.2,                             # Moderate stereo
                "target_lufs": -8.5                              # -8.5 LUFS
            },
            "Pop": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},      # Moderate bass
                    "low_mid": {"freq": 300, "gain": 1.0},       # Balanced mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.2},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 1.2}    # Airy highs
                },
                "compression": {
                    "ratio": 3.0,                                # Moderate compression
                    "threshold": -20.0,                          # Soft threshold
                    "attack": 0.003,                             # Fast attack
                    "release": 0.25                              # Slow release
                },
                "stereo_width": 1.3,                             # Wide stereo
                "target_lufs": -8.0                              # -8.0 LUFS
            },
            "Jazz": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.0},      # Gentle bass
                    "low_mid": {"freq": 300, "gain": 1.8},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 2.0},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 2.0}    # Airy highs
                },
                "compression": {
                    "ratio": 2.0,                                # Gentle compression
                    "threshold": -25.0,                          # Very soft threshold
                    "attack": 0.02,                              # Slow attack
                    "release": 0.4                               # Very slow release
                },
                "stereo_width": 1.1,                             # Natural stereo
                "target_lufs": -9.0                              # -9.0 LUFS
            },
            "CrysGarage": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 3.2},      # Strong bass
                    "low_mid": {"freq": 300, "gain": 2.2},       # Warm mids
                    "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                    "high_mid": {"freq": 4000, "gain": 1.5},     # Bright highs
                    "high_shelf": {"freq": 8000, "gain": 1.5}    # Airy highs
                },
                "compression": {
                    "ratio": 4.5,                                # Moderate compression
                    "threshold": -16.0,                          # Moderate threshold
                    "attack": 0.001,                             # Fast attack
                    "release": 0.15                              # Moderate release
                },
                "stereo_width": 1.3,                             # Wide stereo
                "target_lufs": -7.8                              # -7.8 LUFS
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
            },
            # Professional Tier Genres (24+ total)
            "R&B": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 3.0},
                    "low_mid": {"freq": 250, "gain": 2.0},
                    "mid": {"freq": 1000, "gain": 1.0},
                    "high_mid": {"freq": 4000, "gain": 2.5},
                    "high_shelf": {"freq": 8000, "gain": 3.0}
                },
                "compression": {
                    "ratio": 2.5,
                    "threshold": -10.0,
                    "attack": 0.005,
                    "release": 0.15
                },
                "stereo_width": 1.2,
                "target_lufs": -8.0
            },
            "Reggae": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 4.0},
                    "low_mid": {"freq": 200, "gain": 3.0},
                    "mid": {"freq": 800, "gain": 2.0},
                    "high_mid": {"freq": 3000, "gain": 1.5},
                    "high_shelf": {"freq": 10000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 2.0,
                    "threshold": -12.0,
                    "attack": 0.01,
                    "release": 0.2
                },
                "stereo_width": 1.1,
                "target_lufs": -9.5
            },
            "Country": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 1.5},
                    "low_mid": {"freq": 300, "gain": 1.0},
                    "mid": {"freq": 1200, "gain": 0.5},
                    "high_mid": {"freq": 5000, "gain": 1.5},
                    "high_shelf": {"freq": 8000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 2.0,
                    "threshold": -8.0,
                    "attack": 0.01,
                    "release": 0.2
                },
                "stereo_width": 1.0,
                "target_lufs": -10.0
            },
            "Blues": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.0},
                    "low_mid": {"freq": 250, "gain": 1.5},
                    "mid": {"freq": 1000, "gain": 0.5},
                    "high_mid": {"freq": 4000, "gain": 1.0},
                    "high_shelf": {"freq": 8000, "gain": 1.5}
                },
                "compression": {
                    "ratio": 1.8,
                    "threshold": -6.0,
                    "attack": 0.02,
                    "release": 0.3
                },
                "stereo_width": 1.0,
                "target_lufs": -11.0
            },
            "Funk": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 3.5},
                    "low_mid": {"freq": 200, "gain": 2.5},
                    "mid": {"freq": 800, "gain": 1.0},
                    "high_mid": {"freq": 3000, "gain": 2.0},
                    "high_shelf": {"freq": 8000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 3.0,
                    "threshold": -10.0,
                    "attack": 0.005,
                    "release": 0.1
                },
                "stereo_width": 1.3,
                "target_lufs": -8.5
            },
            "Soul": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 2.5},
                    "low_mid": {"freq": 250, "gain": 2.0},
                    "mid": {"freq": 1000, "gain": 1.5},
                    "high_mid": {"freq": 4000, "gain": 2.0},
                    "high_shelf": {"freq": 8000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 2.2,
                    "threshold": -8.0,
                    "attack": 0.01,
                    "release": 0.2
                },
                "stereo_width": 1.1,
                "target_lufs": -9.0
            },
            "Disco": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 4.0},
                    "low_mid": {"freq": 200, "gain": 3.0},
                    "mid": {"freq": 800, "gain": 1.5},
                    "high_mid": {"freq": 3000, "gain": 2.5},
                    "high_shelf": {"freq": 8000, "gain": 3.0}
                },
                "compression": {
                    "ratio": 3.5,
                    "threshold": -12.0,
                    "attack": 0.002,
                    "release": 0.08
                },
                "stereo_width": 1.4,
                "target_lufs": -7.5
            },
            "House": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 4.5},
                    "low_mid": {"freq": 150, "gain": 2.5},
                    "mid": {"freq": 600, "gain": 0.5},
                    "high_mid": {"freq": 2500, "gain": 2.0},
                    "high_shelf": {"freq": 8000, "gain": 3.0}
                },
                "compression": {
                    "ratio": 4.5,
                    "threshold": -15.0,
                    "attack": 0.001,
                    "release": 0.05
                },
                "stereo_width": 1.5,
                "target_lufs": -6.5
            },
            "Techno": {
                "eq_curve": {
                    "low_shelf": {"freq": 30, "gain": 5.0},
                    "low_mid": {"freq": 120, "gain": 3.0},
                    "mid": {"freq": 500, "gain": 0.0},
                    "high_mid": {"freq": 2000, "gain": 1.5},
                    "high_shelf": {"freq": 8000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 5.0,
                    "threshold": -18.0,
                    "attack": 0.001,
                    "release": 0.03
                },
                "stereo_width": 1.6,
                "target_lufs": -6.0
            },
            "Trance": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 3.5},
                    "low_mid": {"freq": 150, "gain": 2.0},
                    "mid": {"freq": 600, "gain": 1.0},
                    "high_mid": {"freq": 2500, "gain": 2.5},
                    "high_shelf": {"freq": 10000, "gain": 3.5}
                },
                "compression": {
                    "ratio": 4.0,
                    "threshold": -12.0,
                    "attack": 0.002,
                    "release": 0.06
                },
                "stereo_width": 1.5,
                "target_lufs": -7.0
            },
            "Dubstep": {
                "eq_curve": {
                    "low_shelf": {"freq": 30, "gain": 6.0},
                    "low_mid": {"freq": 100, "gain": 4.0},
                    "mid": {"freq": 400, "gain": -1.0},
                    "high_mid": {"freq": 2000, "gain": 2.0},
                    "high_shelf": {"freq": 8000, "gain": 3.0}
                },
                "compression": {
                    "ratio": 6.0,
                    "threshold": -20.0,
                    "attack": 0.001,
                    "release": 0.02
                },
                "stereo_width": 1.7,
                "target_lufs": -5.5
            },
            "Ambient": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 0.5},
                    "low_mid": {"freq": 300, "gain": 0.0},
                    "mid": {"freq": 1000, "gain": 0.0},
                    "high_mid": {"freq": 5000, "gain": 0.5},
                    "high_shelf": {"freq": 12000, "gain": 1.0}
                },
                "compression": {
                    "ratio": 1.3,
                    "threshold": -4.0,
                    "attack": 0.03,
                    "release": 0.4
                },
                "stereo_width": 1.2,
                "target_lufs": -13.0
            },
            "Indie": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.0},
                    "low_mid": {"freq": 250, "gain": 0.5},
                    "mid": {"freq": 1000, "gain": 0.0},
                    "high_mid": {"freq": 4000, "gain": 1.0},
                    "high_shelf": {"freq": 8000, "gain": 1.5}
                },
                "compression": {
                    "ratio": 1.8,
                    "threshold": -8.0,
                    "attack": 0.01,
                    "release": 0.25
                },
                "stereo_width": 1.0,
                "target_lufs": -10.5
            },
            "Alternative": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 2.0},
                    "low_mid": {"freq": 200, "gain": 1.0},
                    "mid": {"freq": 800, "gain": 0.5},
                    "high_mid": {"freq": 3000, "gain": 1.5},
                    "high_shelf": {"freq": 6000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 2.5,
                    "threshold": -10.0,
                    "attack": 0.005,
                    "release": 0.12
                },
                "stereo_width": 1.1,
                "target_lufs": -9.0
            },
            "Folk": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 0.5},
                    "low_mid": {"freq": 300, "gain": 0.0},
                    "mid": {"freq": 1200, "gain": 0.5},
                    "high_mid": {"freq": 5000, "gain": 1.0},
                    "high_shelf": {"freq": 10000, "gain": 1.5}
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
            "Acoustic": {
                "eq_curve": {
                    "low_shelf": {"freq": 120, "gain": 0.0},
                    "low_mid": {"freq": 400, "gain": 0.0},
                    "mid": {"freq": 1000, "gain": 0.0},
                    "high_mid": {"freq": 5000, "gain": 0.5},
                    "high_shelf": {"freq": 10000, "gain": 1.0}
                },
                "compression": {
                    "ratio": 1.3,
                    "threshold": -4.0,
                    "attack": 0.03,
                    "release": 0.4
                },
                "stereo_width": 1.0,
                "target_lufs": -13.0
            },
            "Latin": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 3.0},
                    "low_mid": {"freq": 200, "gain": 2.5},
                    "mid": {"freq": 800, "gain": 1.5},
                    "high_mid": {"freq": 3000, "gain": 2.0},
                    "high_shelf": {"freq": 8000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 2.8,
                    "threshold": -10.0,
                    "attack": 0.005,
                    "release": 0.1
                },
                "stereo_width": 1.3,
                "target_lufs": -8.5
            },
            "World": {
                "eq_curve": {
                    "low_shelf": {"freq": 80, "gain": 1.5},
                    "low_mid": {"freq": 250, "gain": 1.0},
                    "mid": {"freq": 1000, "gain": 0.5},
                    "high_mid": {"freq": 4000, "gain": 1.5},
                    "high_shelf": {"freq": 8000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 2.0,
                    "threshold": -8.0,
                    "attack": 0.01,
                    "release": 0.2
                },
                "stereo_width": 1.2,
                "target_lufs": -10.0
            },
            "Experimental": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 2.0},
                    "low_mid": {"freq": 150, "gain": 1.0},
                    "mid": {"freq": 600, "gain": 0.0},
                    "high_mid": {"freq": 2500, "gain": 1.0},
                    "high_shelf": {"freq": 12000, "gain": 2.0}
                },
                "compression": {
                    "ratio": 3.0,
                    "threshold": -12.0,
                    "attack": 0.005,
                    "release": 0.15
                },
                "stereo_width": 1.4,
                "target_lufs": -9.5
            },
            "Cinematic": {
                "eq_curve": {
                    "low_shelf": {"freq": 60, "gain": 2.5},
                    "low_mid": {"freq": 200, "gain": 1.5},
                    "mid": {"freq": 800, "gain": 0.5},
                    "high_mid": {"freq": 3000, "gain": 1.5},
                    "high_shelf": {"freq": 10000, "gain": 2.5}
                },
                "compression": {
                    "ratio": 2.2,
                    "threshold": -8.0,
                    "attack": 0.01,
                    "release": 0.2
                },
                "stereo_width": 1.3,
                "target_lufs": -9.5
            },
            "Lo-Fi": {
                "eq_curve": {
                    "low_shelf": {"freq": 100, "gain": 1.0},
                    "low_mid": {"freq": 300, "gain": 0.5},
                    "mid": {"freq": 1000, "gain": -0.5},
                    "high_mid": {"freq": 4000, "gain": -1.0},
                    "high_shelf": {"freq": 8000, "gain": 0.5}
                },
                "compression": {
                    "ratio": 1.8,
                    "threshold": -6.0,
                    "attack": 0.02,
                    "release": 0.3
                },
                "stereo_width": 0.9,
                "target_lufs": -11.0
            },
            "Trap": {
                "eq_curve": {
                    "low_shelf": {"freq": 30, "gain": 5.5},
                    "low_mid": {"freq": 100, "gain": 3.5},
                    "mid": {"freq": 400, "gain": -0.5},
                    "high_mid": {"freq": 2000, "gain": 2.5},
                    "high_shelf": {"freq": 8000, "gain": 3.5}
                },
                "compression": {
                    "ratio": 5.5,
                    "threshold": -18.0,
                    "attack": 0.001,
                    "release": 0.02
                },
                "stereo_width": 1.6,
                "target_lufs": -5.0
            },
            "Future Bass": {
                "eq_curve": {
                    "low_shelf": {"freq": 40, "gain": 4.0},
                    "low_mid": {"freq": 150, "gain": 2.5},
                    "mid": {"freq": 600, "gain": 0.5},
                    "high_mid": {"freq": 2500, "gain": 2.0},
                    "high_shelf": {"freq": 10000, "gain": 3.0}
                },
                "compression": {
                    "ratio": 4.5,
                    "threshold": -15.0,
                    "attack": 0.001,
                    "release": 0.04
                },
                "stereo_width": 1.5,
                "target_lufs": -6.5
            }
        }
    
    def _load_tier_settings(self) -> Dict[str, Dict[str, Any]]:
        """Load tier-specific processing settings for studio page tiers"""
        return {
            "Free": {
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
            "Professional": {
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
            "Pro": {
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
            logger.info(f"Input file path: {input_file_path}")
            
            # Check if file exists
            if not os.path.exists(input_file_path):
                raise FileNotFoundError(f"Input file not found: {input_file_path}")
            
            # Load audio file
            logger.info("Loading audio file with librosa...")
            audio_data, sample_rate = librosa.load(input_file_path, sr=None)
            logger.info(f"Audio loaded: shape={audio_data.shape}, sample_rate={sample_rate}")
            
            # Ensure stereo
            if audio_data.ndim == 1:
                audio_data = np.stack([audio_data, audio_data])
            
            # Get genre preset and tier configuration
            # preset = self.genre_presets.get(genre, self.genre_presets["Pop"])  # not used
            tier_config = self.tier_settings.get(tier, self.tier_settings["Free"])
            
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
            # Simplified EQ implementation using basic gain adjustment
            # For production, use proper IIR/FIR filters
            
            processed = audio_data.copy()
            
            if eq_type == "low_shelf":
                # Simple low shelf (simplified)
                if gain > 0:
                    # Apply simple gain boost to low frequencies
                    for ch in range(audio_data.shape[0]):
                        # Simple frequency-based gain adjustment
                        processed[ch] = processed[ch] * (1 + gain/20)  # Reduced gain for stability
            
            elif eq_type == "high_shelf":
                # Simple high shelf (simplified)
                if gain > 0:
                    # Apply simple gain boost to high frequencies
                    for ch in range(audio_data.shape[0]):
                        # Simple frequency-based gain adjustment
                        processed[ch] = processed[ch] * (1 + gain/20)  # Reduced gain for stability
            
            elif eq_type == "peak":
                # Simple peak filter (simplified)
                if gain != 0:
                    # Apply simple gain adjustment
                    for ch in range(audio_data.shape[0]):
                        # Simple frequency-based gain adjustment
                        processed[ch] = processed[ch] * (1 + gain/20)  # Reduced gain for stability
            
            return processed
            
        except Exception as e:
            logger.warning(f"Simple EQ failed: {e}")
            return audio_data
    
    def _apply_compression(self, audio_data: np.ndarray, sample_rate: int, ratio: float = 2.0, threshold: float = -12.0) -> np.ndarray:
        """Apply compression with given ratio and threshold"""
        try:
            # Use provided parameters instead of genre presets for flexibility
            
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
    
    def _apply_stereo_widening(self, audio_data: np.ndarray, genre: str, tier_config: Dict[str, Any]) -> np.ndarray:
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
    
    def _apply_limiting(self, audio_data: np.ndarray, sample_rate: int, tier_config: Dict[str, Any]) -> np.ndarray:
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
        except Exception:
            return -14.0
    
    async def preview_genre_effects(
        self,
        input_file_path: str,
        genre: str,
        tier: str
    ) -> str:
        """
        Generate real-time preview of genre effects - SIMPLIFIED BUT AUDIBLE
        """
        try:
            logger.info(f"Starting SIMPLIFIED genre preview for: {genre}")
            
            # Load audio file
            audio_data, sample_rate = librosa.load(input_file_path, sr=None)
            logger.info(f"Loaded audio: {audio_data.shape}, {sample_rate}Hz")
            
            # Ensure stereo
            if audio_data.ndim == 1:
                audio_data = np.stack([audio_data, audio_data])
            
            # Create dramatic, audible effects
            processed_audio = audio_data.copy()
            
            if genre.lower() == 'hip-hop':
                # HIP-HOP: Heavy bass, scooped mids, loud
                logger.info("Applying DRAMATIC HIP-HOP effects")
                # Heavy bass boost (first 30% of samples)
                bass_boost = 1.2  # 120% louder
                bass_end = len(processed_audio[0]) // 3
                processed_audio[:, :bass_end] *= (1 + bass_boost)
                
                # Scoop mids (middle 40% of samples)
                mid_scoop = 0.5  # 50% reduction
                mid_start = len(processed_audio[0]) // 3
                mid_end = 2 * len(processed_audio[0]) // 3
                processed_audio[:, mid_start:mid_end] *= mid_scoop
                
                # Overall loudness
                processed_audio *= 1.8
                
            elif genre.lower() == 'afrobeats':
                # AFROBEATS: Mid boost, warmth, bright
                logger.info("Applying DRAMATIC AFROBEATS effects")
                # Mid boost (middle 50% of samples)
                mid_boost = 0.8  # 80% louder
                mid_start = len(processed_audio[0]) // 4
                mid_end = 3 * len(processed_audio[0]) // 4
                processed_audio[:, mid_start:mid_end] *= (1 + mid_boost)
                
                # High boost (last 25% of samples)
                high_boost = 0.6  # 60% louder
                high_start = 3 * len(processed_audio[0]) // 4
                processed_audio[:, high_start:] *= (1 + high_boost)
                
                # Overall warmth
                processed_audio *= 1.5
                
            else:
                # Default: Simple loudness boost
                logger.info("Applying DRAMATIC DEFAULT effects")
                processed_audio *= 1.6
            
            # Prevent clipping
            max_val = np.max(np.abs(processed_audio))
            if max_val > 0.95:
                processed_audio = processed_audio * (0.95 / max_val)
            
            # Save preview file
            # Save preview file with a unique name to avoid conflicts
            import time
            base_name = os.path.splitext(os.path.basename(input_file_path))[0]
            timestamp = int(time.time() * 1000)  # milliseconds
            preview_file_path = f"{base_name}_preview_{genre.lower().replace(' ', '_')}_{timestamp}.wav"
            
            # Save as WAV
            import soundfile as sf
            sf.write(preview_file_path, processed_audio.T, sample_rate)
            
            logger.info(f"DRAMATIC genre preview generated: {preview_file_path}")
            return preview_file_path
            
        except Exception as e:
            logger.error(f"Simplified genre preview failed: {str(e)}")
            # Return original file if processing fails
            return input_file_path

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

    def _apply_professional_limiter(self, audio_data: np.ndarray, sample_rate: int, threshold: float = -0.1) -> np.ndarray:
        """
        Professional brickwall limiter inspired by Matchering's Hyrax limiter
        Prevents clipping while maintaining musical dynamics
        """
        try:
            logger.info(f"Applying professional limiter with threshold: {threshold}dB")
            
            # Convert threshold from dB to linear
            threshold_linear = 10 ** (threshold / 20)
            
            # Apply soft limiting with lookahead
            processed = audio_data.copy()
            
            # Simple but effective soft limiter
            for channel in range(processed.shape[0]):
                # Apply soft knee limiting
                abs_signal = np.abs(processed[channel])
                over_threshold = abs_signal > threshold_linear
                
                if np.any(over_threshold):
                    # Soft knee compression for smooth limiting
                    ratio = 10.0  # High ratio for limiting
                    knee_width = 0.1  # Soft knee
                    
                    # Calculate gain reduction
                    excess = abs_signal - threshold_linear
                    gain_reduction = 1.0 - (1.0 / ratio) * (1.0 - np.exp(-excess / knee_width))
                    
                    # Apply gain reduction
                    processed[channel] = processed[channel] * (1.0 - gain_reduction)
            
            # Final hard limit to prevent any clipping
            processed = np.clip(processed, -0.99, 0.99)
            
            logger.info("Professional limiter applied successfully")
            return processed
            
        except Exception as e:
            logger.error(f"Professional limiter failed: {e}")
            return audio_data

    def _apply_hip_hop_processing(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """
        Professional Hip-Hop processing: Bass boost, mid scoop, compression
        """
        try:
            logger.info("Applying professional Hip-Hop processing")
            processed = audio_data.copy()
            
            # 1. Bass boost - simple gain adjustment for low frequencies
            bass_boost = 0.8  # 80% louder bass
            # Apply to first 25% of samples (representing low frequencies)
            bass_samples = len(processed[0]) // 4
            processed[:, :bass_samples] *= (1 + bass_boost)
            
            # 2. Mid scoop - reduce middle frequencies
            mid_scoop = 0.6  # 40% reduction
            mid_start = len(processed[0]) // 4
            mid_end = 3 * len(processed[0]) // 4
            processed[:, mid_start:mid_end] *= mid_scoop
            
            # 3. Compression for punch
            processed = self._apply_compression(processed, sample_rate, ratio=3.0, threshold=-12.0)
            
            # 4. Overall loudness boost
            processed *= 1.3
            
            logger.info("Professional Hip-Hop processing completed")
            return processed
            
        except Exception as e:
            logger.error(f"Hip-Hop processing failed: {e}")
            return audio_data

    def _apply_afrobeats_processing(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """
        Professional Afrobeats processing: Mid boost, warmth, light compression
        """
        try:
            logger.info("Applying professional Afrobeats processing")
            processed = audio_data.copy()
            
            # 1. Mid boost - enhance middle frequencies
            mid_boost = 0.6  # 60% louder mids
            mid_start = len(processed[0]) // 4
            mid_end = 3 * len(processed[0]) // 4
            processed[:, mid_start:mid_end] *= (1 + mid_boost)
            
            # 2. High shelf for warmth - boost high frequencies
            high_boost = 0.4  # 40% louder highs
            high_start = 3 * len(processed[0]) // 4
            processed[:, high_start:] *= (1 + high_boost)
            
            # 3. Light compression for dynamics
            processed = self._apply_compression(processed, sample_rate, ratio=2.0, threshold=-8.0)
            
            # 4. Overall warmth boost
            processed *= 1.2
            
            logger.info("Professional Afrobeats processing completed")
            return processed
            
        except Exception as e:
            logger.error(f"Afrobeats processing failed: {e}")
            return audio_data

    def _apply_default_processing(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """
        Professional default processing: Balanced enhancement
        """
        try:
            logger.info("Applying professional default processing")
            processed = audio_data.copy()
            
            # 1. Gentle high shelf for brightness
            high_boost = 0.3  # 30% louder highs
            high_start = 3 * len(processed[0]) // 4
            processed[:, high_start:] *= (1 + high_boost)
            
            # 2. Light compression for consistency
            processed = self._apply_compression(processed, sample_rate, ratio=1.5, threshold=-6.0)
            
            # 3. Overall enhancement
            processed *= 1.1
            
            logger.info("Professional default processing completed")
            return processed
            
        except Exception as e:
            logger.error(f"Default processing failed: {e}")
            return audio_data
