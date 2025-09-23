"""
Genre Presets - EQ Only
Contains genre-specific EQ curves for audio mastering
"""

from typing import Dict, Any

def get_genre_presets() -> Dict[str, Dict[str, Any]]:
    """Load genre-specific EQ presets only"""
    return {
        # West African Genres
        "Afrobeats": {
            "eq_curve": {
                "low_shelf": {"freq": 100, "gain": 2.0},     # +2dB at 100Hz
                "low_mid": {"freq": 300, "gain": -0.5},      # Slight dip at 300Hz
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral mids
                "high_mid": {"freq": 4000, "gain": 1.0},     # Wide mids
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Tape warmth
            }
        },
        "Alté": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.5},      # Soften low mids
                "low_mid": {"freq": 300, "gain": -1.0},      # Soften low mids
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Airy
                "high_shelf": {"freq": 12000, "gain": 3.0}   # Airy highs +3dB
            }
        },
        "Hip-life": {
            "eq_curve": {
                "low_shelf": {"freq": 70, "gain": 2.5},      # Push 60-80Hz kick
                "low_mid": {"freq": 300, "gain": 1.0},       # Brighten vocals
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.5},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Brighten vocals
            }
        },
        "Azonto": {
            "eq_curve": {
                "low_shelf": {"freq": 100, "gain": 2.0},     # Boost 100Hz
                "low_mid": {"freq": 300, "gain": 0.5},       # Dance punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Dance energy
                "high_shelf": {"freq": 8000, "gain": 2.0}    # Boost 8kHz
            }
        },
        "Naija Pop": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.8},      # Balance low punch
                "low_mid": {"freq": 300, "gain": 1.0},       # Modern clean
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Pop sheen
                "high_shelf": {"freq": 8000, "gain": 1.8}    # High sparkle
            }
        },
        "Bongo Flava": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 2.0},      # +2dB lows
                "low_mid": {"freq": 300, "gain": 0.8},       # Smooth vocal glue
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Silky highs
            }
        },
        
        # South African Genres
        "Amapiano": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 2.5},      # Boost sub 40-60Hz
                "low_mid": {"freq": 300, "gain": -0.8},      # Control mids
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Transient clarity
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Wide low-pass reverb
            }
        },
        "Kwaito": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 2.2},      # Emphasize bassline
                "low_mid": {"freq": 300, "gain": 0.5},       # Groove tight
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.8},     # Controlled
                "high_shelf": {"freq": 8000, "gain": 0.8}    # Subtle tape hiss vibe
            }
        },
        "Gqom": {
            "eq_curve": {
                "low_shelf": {"freq": 40, "gain": 3.0},      # Deep subs +3dB
                "low_mid": {"freq": 200, "gain": -1.5},      # Cut 200Hz mud
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Wide highs
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Distortion edge
            }
        },
        "Shangaan Electro": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Moderate lows
                "low_mid": {"freq": 300, "gain": 0.2},       # Tight fast
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Transient sharpener
                "high_shelf": {"freq": 12000, "gain": 2.5}   # Boost highs 10-14kHz
            }
        },
        "Kwela": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.0},      # Moderate lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 2000, "gain": 2.0},          # Emphasize midrange pennywhistle
                "high_mid": {"freq": 4000, "gain": 1.5},     # Pennywhistle clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Tape warmth
            }
        },
        
        # Central/East African Genres
        "Kuduro": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 2.5},      # Low punch
                "low_mid": {"freq": 300, "gain": 0.5},       # Club energy
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Crisp highs
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Saturation drive
            }
        },
        "Ndombolo": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Moderate lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Natural wide
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Exciter for sparkle
            }
        },
        "Gengetone": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 2.0},      # Low punch
                "low_mid": {"freq": 300, "gain": 0.0},       # Neutral
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Centered vocals
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Saturation
            }
        },
        
        # International Genres
        "Pop": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.0},      # Balanced lows
                "low_mid": {"freq": 300, "gain": 0.5},       # Warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Presence
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Air
            }
        },
        "Hip Hop": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 2.5},      # Deep bass
                "low_mid": {"freq": 300, "gain": 0.0},       # Neutral
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Crisp highs
            }
        },
        "R&B": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Warm lows
                "low_mid": {"freq": 300, "gain": 0.8},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.2},     # Vocal presence
                "high_shelf": {"freq": 8000, "gain": 1.8}    # Smooth highs
            }
        },
        "Rock": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.0},      # Controlled lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Neutral
                "mid": {"freq": 1000, "gain": 0.5},          # Mid presence
                "high_mid": {"freq": 4000, "gain": 1.5},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Controlled highs
            }
        },
        "Electronic": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 2.0},      # Sub bass
                "low_mid": {"freq": 300, "gain": -0.5},      # Clean mids
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Synth presence
                "high_shelf": {"freq": 8000, "gain": 2.0}    # Bright highs
            }
        },
        "Jazz": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.5},      # Natural lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.5},     # Natural presence
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Natural air
            }
        },
        "Classical": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.0},      # Natural lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.0},     # Natural
                "high_shelf": {"freq": 8000, "gain": 0.0}    # Natural
            }
        },
        "Reggae": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Warm bass
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.5},     # Natural presence
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Natural highs
            }
        },
        "Country": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.5},      # Natural lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 1000, "gain": 0.5},          # Vocal presence
                "high_mid": {"freq": 4000, "gain": 1.0},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Natural highs
            }
        },
        "Blues": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.0},      # Warm lows
                "low_mid": {"freq": 300, "gain": 0.0},       # Natural
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Natural highs
            }
        },
        
        # Additional Advanced Genres
        "Trap": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 3.5},      # Heavy bass
                "low_mid": {"freq": 200, "gain": 1.2},       # Punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.6},     # Crisp highs
                "high_shelf": {"freq": 8000, "gain": 0.6}    # Bright
            }
        },
        "Drill": {
            "eq_curve": {
                "low_shelf": {"freq": 70, "gain": 3.0},      # Deep bass
                "low_mid": {"freq": 250, "gain": 1.8},       # Aggressive mids
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.7},     # Sharp
                "high_shelf": {"freq": 8000, "gain": 0.7}    # Bright
            }
        },
        "Dubstep": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 4.0},      # Massive bass
                "low_mid": {"freq": 150, "gain": 1.0},       # Sub presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.8},     # Wobble clarity
                "high_shelf": {"freq": 8000, "gain": 0.8}    # Bright
            }
        },
        "Gospel": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Warm lows
                "low_mid": {"freq": 300, "gain": 2.0},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Natural highs
            }
        },
        "Lofi Hip-Hop": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.8},      # Soft lows
                "low_mid": {"freq": 300, "gain": 1.5},       # Warm mids
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.2},     # Soft presence
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Gentle highs
            }
        },
        "House": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 2.5},      # Deep house bass
                "low_mid": {"freq": 200, "gain": 1.8},       # Punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright
            }
        },
        "Techno": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 3.2},      # Heavy techno bass
                "low_mid": {"freq": 150, "gain": 1.6},       # Punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.9},     # Sharp
                "high_shelf": {"freq": 8000, "gain": 0.9}    # Bright
            }
        },
        "Highlife": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.8},      # Warm bass
                "low_mid": {"freq": 300, "gain": 2.2},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.2},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Natural highs
            }
        },
        "Instrumentals": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Balanced lows
                "low_mid": {"freq": 300, "gain": 2.0},       # Instrument presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.5},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Bright
            }
        },
        "Beats": {
            "eq_curve": {
                "low_shelf": {"freq": 70, "gain": 2.2},      # Beat punch
                "low_mid": {"freq": 250, "gain": 1.8},       # Rhythm
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright
            }
        },
        "Trance": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 2.0},      # Trance bass
                "low_mid": {"freq": 200, "gain": 1.5},       # Warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.8},     # Lead presence
                "high_shelf": {"freq": 8000, "gain": 1.8}    # Bright leads
            }
        },
        "Drum & Bass": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 3.8},      # Massive bass
                "low_mid": {"freq": 150, "gain": 1.4},       # Sub presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright
            }
        },
        "Voice Over": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.8},      # Natural lows
                "low_mid": {"freq": 300, "gain": 2.8},       # Vocal presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 2.2},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 2.2}    # Bright
            }
        },
        "Journalist": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 0.6},      # Natural lows
                "low_mid": {"freq": 300, "gain": 3.0},       # Voice presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 2.5},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 2.5}    # Bright
            }
        },
        "Soul": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.2},      # Warm lows
                "low_mid": {"freq": 300, "gain": 2.5},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.8},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.8}    # Natural highs
            }
        },
        "Content Creator": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Balanced lows
                "low_mid": {"freq": 300, "gain": 2.0},       # Voice presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.5},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Bright
            }
        },
        "CrysGarage": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 3.2},      # Signature bass
                "low_mid": {"freq": 200, "gain": 2.2},       # Warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.5},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Bright
            }
        },
        
        # Missing African Genres
        "Shrap": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 3.8},      # Heavy bass
                "low_mid": {"freq": 150, "gain": 1.4},       # Punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright
            }
        },
        "Singeli": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 4.0},      # Massive bass
                "low_mid": {"freq": 150, "gain": 1.0},       # Sub presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.8},     # Wobble clarity
                "high_shelf": {"freq": 8000, "gain": 0.8}    # Bright
            }
        },
        "Urban Benga": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.8},      # Warm bass
                "low_mid": {"freq": 300, "gain": 2.2},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.2},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Natural highs
            }
        },
        "New Benga": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.8},      # Warm bass
                "low_mid": {"freq": 300, "gain": 2.2},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.2},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Natural highs
            }
        },
        "Raï N'B": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.2},      # Warm lows
                "low_mid": {"freq": 300, "gain": 2.5},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.8},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.8}    # Natural highs
            }
        },
        "Raï-hop": {
            "eq_curve": {
                "low_shelf": {"freq": 60, "gain": 3.0},      # Deep bass
                "low_mid": {"freq": 200, "gain": 1.5},       # Punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 0.8},     # Sharp
                "high_shelf": {"freq": 8000, "gain": 0.8}    # Bright
            }
        },
        "Gnawa Fusion": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.8},      # Warm bass
                "low_mid": {"freq": 300, "gain": 2.2},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.2},     # Guitar presence
                "high_shelf": {"freq": 8000, "gain": 1.2}    # Natural highs
            }
        },
        "Afrotrap": {
            "eq_curve": {
                "low_shelf": {"freq": 50, "gain": 3.8},      # Heavy bass
                "low_mid": {"freq": 150, "gain": 1.4},       # Punch
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Bright
            }
        },
        "Afro-Gospel": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Warm lows
                "low_mid": {"freq": 300, "gain": 2.0},       # Vocal warmth
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.0},     # Vocal clarity
                "high_shelf": {"freq": 8000, "gain": 1.0}    # Natural highs
            }
        },
        "Urban Gospel": {
            "eq_curve": {
                "low_shelf": {"freq": 80, "gain": 1.5},      # Balanced lows
                "low_mid": {"freq": 300, "gain": 2.0},       # Voice presence
                "mid": {"freq": 1000, "gain": 0.0},          # Neutral
                "high_mid": {"freq": 4000, "gain": 1.5},     # Clarity
                "high_shelf": {"freq": 8000, "gain": 1.5}    # Bright
            }
        }
    }
