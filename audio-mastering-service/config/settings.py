"""
Configuration management using python-decouple and dynaconf.
"""
from decouple import config
from dynaconf import Dynaconf
from typing import Optional

# Load environment variables
DEBUG = config('DEBUG', default=False, cast=bool)
LOG_LEVEL = config('LOG_LEVEL', default='INFO')
SENTRY_DSN = config('SENTRY_DSN', default=None)

# Audio processing settings
DEFAULT_TARGET_LUFS = config('DEFAULT_TARGET_LUFS', default=-8.0, cast=float)
MAX_FILE_SIZE_MB = config('MAX_FILE_SIZE_MB', default=100, cast=int)
PROCESSING_TIMEOUT = config('PROCESSING_TIMEOUT', default=300, cast=int)

# Resource monitoring settings
MAX_CPU_PERCENT = config('MAX_CPU_PERCENT', default=80.0, cast=float)
MAX_MEMORY_PERCENT = config('MAX_MEMORY_PERCENT', default=80.0, cast=float)
MAX_DISK_PERCENT = config('MAX_DISK_PERCENT', default=90.0, cast=float)

# Storage settings
TEMP_DIR = config('TEMP_DIR', default='/tmp/audio_processing')
OUTPUT_DIR = config('OUTPUT_DIR', default='/tmp/audio_output')

# Create dynaconf instance for more complex configuration
settings = Dynaconf(
    settings_files=['config/settings.yaml', 'config/.secrets.yaml'],
    environments=True,
    envvar_prefix='CRYSGARAGE',
    load_dotenv=True,
)

# Audio mastering presets
AUDIO_PRESETS = {
    'free': {
        'target_lufs': -8.0,
        'max_processing_time': 300,
        'allowed_formats': ['mp3', 'wav']
    },
    'premium': {
        'target_lufs': -7.0,
        'max_processing_time': 600,
        'allowed_formats': ['mp3', 'wav', 'flac']
    },
    'professional': {
        'target_lufs': -6.0,
        'max_processing_time': 900,
        'allowed_formats': ['mp3', 'wav', 'flac', 'aiff']
    }
}

# Genre-specific settings
GENRE_SETTINGS = {
    'afrobeats': {
        'target_lufs': -8.0,
        'dynamic_range': 8.0,
        'frequency_balance': 0.7
    },
    'hip-hop': {
        'target_lufs': -7.5,
        'dynamic_range': 6.0,
        'frequency_balance': 0.8
    },
    'pop': {
        'target_lufs': -8.5,
        'dynamic_range': 10.0,
        'frequency_balance': 0.6
    },
    'rock': {
        'target_lufs': -7.0,
        'dynamic_range': 12.0,
        'frequency_balance': 0.9
    }
}
