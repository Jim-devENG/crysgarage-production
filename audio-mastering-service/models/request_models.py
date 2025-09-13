"""
Request and Response models for the Audio Mastering Microservice
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from enum import Enum

class Tier(str, Enum):
    FREE = "Free"
    PRO = "Pro"
    ADVANCED = "Advanced"

class Genre(str, Enum):
    HIP_HOP = "Hip-Hop"
    AFROBEATS = "Afrobeats"
    GOSPEL = "Gospel"
    POP = "Pop"
    ROCK = "Rock"
    ELECTRONIC = "Electronic"
    JAZZ = "Jazz"
    CLASSICAL = "Classical"

class AudioFormat(str, Enum):
    WAV = "WAV"
    MP3 = "MP3"
    FLAC = "FLAC"
    AIFF = "AIFF"
    AAC = "AAC"
    OGG = "OGG"

class SampleRate(int, Enum):
    RATE_44100 = 44100
    RATE_48000 = 48000
    RATE_96000 = 96000
    RATE_192000 = 192000

class MasteringRequest(BaseModel):
    """Request model for audio mastering"""
    user_id: int = Field(..., description="User ID from Laravel")
    tier: Tier = Field(..., description="User tier (Free, Pro, Advanced)")
    genre: Genre = Field(..., description="Music genre for mastering preset")
    target_format: AudioFormat = Field(..., description="Target output format")
    target_sample_rate: SampleRate = Field(..., description="Target sample rate")
    file_url: str = Field(..., description="URL of the input audio file")
    target_lufs: float = Field(default=-14.0, description="Target LUFS level (-70 to 0)")
    
    @validator('target_lufs')
    def validate_lufs(cls, v):
        if not -70 <= v <= 0:
            raise ValueError('LUFS must be between -70 and 0')
        return v
    
    @validator('file_url')
    def validate_file_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('file_url must be a valid HTTP/HTTPS URL')
        return v

class MasteringResponse(BaseModel):
    """Response model for audio mastering"""
    status: Literal["done", "processing", "error"] = Field(..., description="Processing status")
    url: Optional[str] = Field(None, description="URL of the mastered audio file")
    lufs: Optional[float] = Field(None, description="Achieved LUFS level")
    format: Optional[str] = Field(None, description="Output format")
    duration: Optional[float] = Field(None, description="Audio duration in seconds")
    sample_rate: Optional[int] = Field(None, description="Sample rate")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    error_message: Optional[str] = Field(None, description="Error message if status is error")

class ErrorResponse(BaseModel):
    """Error response model"""
    status: Literal["error"] = "error"
    error_code: str = Field(..., description="Error code")
    error_message: str = Field(..., description="Human-readable error message")
    details: Optional[dict] = Field(None, description="Additional error details")
