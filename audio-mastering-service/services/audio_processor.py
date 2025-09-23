"""
Audio Processing Service
Handles file downloads, audio analysis, and metadata extraction
"""

import os
import tempfile
import aiohttp
import aiofiles
import librosa
import numpy as np
from typing import Dict, Any, Tuple
import logging
from pathlib import Path
import math

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Handles audio file operations and analysis"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.max_file_size = 500 * 1024 * 1024  # 500MB max file size
        
        
    def is_available(self) -> bool:
        """Check if audio processing service is available"""
        try:
            # Test librosa import and basic functionality
            test_audio = np.random.randn(1000)
            librosa.feature.mfcc(y=test_audio, sr=22050)
            return True
        except Exception as e:
            logger.error(f"Audio processor not available: {e}")
            return False
    
    
    async def save_uploaded_file(self, file, user_id: str) -> str:
        """
        Save uploaded file to temporary location
        
        Args:
            file: Uploaded file object
            user_id: User identifier
            
        Returns:
            str: Path to the saved file
            
        Raises:
            Exception: If save fails or file is too large
        """
        try:
            # Validate file size
            file_size = 0
            content = await file.read()
            file_size = len(content)
            
            if file_size > self.max_file_size:
                raise Exception(f"File too large: {file_size} bytes (max: {self.max_file_size} bytes)")
            
            # Create temporary file
            file_extension = os.path.splitext(file.filename)[1] if file.filename else '.wav'
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=file_extension,
                prefix=f"upload_{user_id}_"
            )
            
            # Write content to temporary file
            temp_file.write(content)
            temp_file.close()
            
            logger.info(f"Saved uploaded file: {temp_file.name} ({file_size} bytes)")
            return temp_file.name
            
        except Exception as e:
            logger.error(f"Failed to save uploaded file: {e}")
            raise

    async def download_file(self, file_url: str) -> str:
        """
        Download audio file from URL to temporary location
        
        Args:
            file_url: URL of the audio file to download
            
        Returns:
            str: Path to the downloaded file
            
        Raises:
            Exception: If download fails or file is too large
        """
        try:
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(
                suffix='.audio',
                delete=False,
                dir=self.temp_dir
            )
            temp_path = temp_file.name
            temp_file.close()
            
            logger.info(f"Downloading file from: {file_url}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(file_url) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to download file: HTTP {response.status}")
                    
                    # Check file size
                    content_length = response.headers.get('content-length')
                    if content_length and int(content_length) > self.max_file_size:
                        raise Exception(f"File too large: {content_length} bytes")
                    
                    # Download file
                    total_size = 0
                    async with aiofiles.open(temp_path, 'wb') as f:
                        async for chunk in response.content.iter_chunked(8192):
                            total_size += len(chunk)
                            if total_size > self.max_file_size:
                                os.unlink(temp_path)
                                raise Exception("File too large during download")
                            await f.write(chunk)
            
            logger.info(f"File downloaded successfully: {temp_path} ({total_size} bytes)")
            return temp_path
            
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            # Cleanup on error
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise
    
    async def get_audio_metadata(self, file_path: str) -> Dict[str, Any]:
        """
        Extract metadata from audio file
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            Dict containing audio metadata
        """
        try:
            logger.info(f"Extracting metadata from: {file_path}")
            
            # Load audio file
            audio_data, sample_rate = librosa.load(file_path, sr=None)
            duration = len(audio_data) / sample_rate
            
            # Calculate LUFS (simplified version)
            lufs = self._calculate_lufs(audio_data, sample_rate)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Calculate RMS and peak levels
            rms = np.sqrt(np.mean(audio_data**2))
            peak = np.max(np.abs(audio_data))
            
            # Calculate dynamic range
            dynamic_range = 20 * np.log10(peak / (rms + 1e-10))
            
            metadata = {
                "duration": duration,
                "sample_rate": sample_rate,
                "channels": 1 if audio_data.ndim == 1 else audio_data.shape[0],
                "lufs": lufs,
                "rms": float(rms),
                "peak": float(peak),
                "dynamic_range": float(dynamic_range),
                "file_size": file_size,
                "format": Path(file_path).suffix.upper().lstrip('.')
            }
            
            logger.info(f"Metadata extracted: {metadata}")
            return metadata
            
        except Exception as e:
            logger.error(f"Failed to extract metadata: {e}")
            return {
                "duration": 0,
                "sample_rate": 0,
                "channels": 0,
                "lufs": 0,
                "rms": 0,
                "peak": 0,
                "dynamic_range": 0,
                "file_size": 0,
                "format": "UNKNOWN"
            }

    async def upload_to_storage(self, file_path: str, user_id: str) -> str:
        """Return a URL for the processed file. For local dev, expose a local static path.

        In production, this should upload to object storage (S3/GCS) and return a public URL.
        For now, we provide a file-serving URL via FastAPI's static handler expectation: /files/{filename}
        """
        try:
            # Ensure file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(file_path)

            filename = os.path.basename(file_path)
            # Assume main.py mounts StaticFiles at /files pointing to the temp dir or storage dir
            # If not mounted, the frontend will still be able to fetch via proxy-download.
            url = f"/files/{filename}"
            logger.info(f"Prepared storage URL: {url} for user {user_id}")
            return url
        except Exception as e:
            logger.error(f"upload_to_storage failed: {e}")
            # As a strict mode, rethrow so the client sees failure and no fallback is used
            raise

    async def cleanup_temp_files(self, file_paths: list):
        """Remove temporary files safely (async signature for compatibility)."""
        for file_path in file_paths:
            try:
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup file {file_path}: {e}")
    
    def _calculate_lufs(self, audio_data: np.ndarray, sample_rate: int) -> float:
        """
        Calculate LUFS (Loudness Units relative to Full Scale)
        Simplified implementation based on ITU-R BS.1770-4
        
        Args:
            audio_data: Audio samples
            sample_rate: Sample rate in Hz
            
        Returns:
            float: LUFS value
        """
        try:
            # Ensure stereo
            if audio_data.ndim == 1:
                audio_data = np.stack([audio_data, audio_data])
            
            # Apply K-weighting filter (simplified)
            # This is a basic implementation - for production, use proper ITU-R BS.1770-4
            k_weighted = self._apply_k_weighting(audio_data, sample_rate)
            
            # Calculate gated loudness
            loudness = self._calculate_gated_loudness(k_weighted)
            
            # Convert to LUFS
            lufs = 20 * np.log10(loudness + 1e-10) - 0.691
            
            return float(lufs)
            
        except Exception as e:
            logger.warning(f"LUFS calculation failed: {e}")
            # Fallback to simple RMS-based calculation
            rms = np.sqrt(np.mean(audio_data**2))
            return float(20 * np.log10(rms + 1e-10))
    
    def _apply_k_weighting(self, audio_data: np.ndarray, sample_rate: int) -> np.ndarray:
        """Apply K-weighting filter (simplified)"""
        # This is a simplified K-weighting implementation
        # For production, implement proper ITU-R BS.1770-4 K-weighting
        return audio_data
    
    def _calculate_gated_loudness(self, audio_data: np.ndarray) -> float:
        """Calculate gated loudness (simplified)"""
        # Simplified gated loudness calculation
        # For production, implement proper ITU-R BS.1770-4 gating
        return np.sqrt(np.mean(audio_data**2))
    
    async def validate_audio_file(self, file_path: str) -> bool:
        """
        Validate that the file is a valid audio file
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            bool: True if valid audio file
        """
        try:
            # Try to load the file with librosa
            audio_data, sample_rate = librosa.load(file_path, sr=None, duration=1.0)
            
            # Basic validation
            if len(audio_data) == 0:
                return False
            
            if sample_rate < 8000 or sample_rate > 192000:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Audio file validation failed: {e}")
            return False
    
    def get_supported_formats(self) -> list:
        """Get list of supported audio formats"""
        return ['.wav', '.mp3', '.flac', '.aiff', '.aac', '.ogg', '.m4a']
    
    def is_format_supported(self, file_path: str) -> bool:
        """Check if file format is supported"""
        ext = Path(file_path).suffix.lower()
        return ext in self.get_supported_formats()
