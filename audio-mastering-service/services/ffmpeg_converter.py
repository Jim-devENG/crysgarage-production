"""
FFmpeg Audio Converter Service
Handles audio format conversion and sample rate changes
"""

import os
import tempfile
import subprocess
import asyncio
from typing import Dict, Any, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class FFmpegConverter:
    """Handles audio format conversion using FFmpeg"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.supported_formats = {
            'WAV': {'ext': '.wav', 'codec': 'pcm_s16le', 'mime': 'audio/wav'},
            'MP3': {'ext': '.mp3', 'codec': 'libmp3lame', 'mime': 'audio/mpeg'},
            'FLAC': {'ext': '.flac', 'codec': 'flac', 'mime': 'audio/flac'},
            'AIFF': {'ext': '.aiff', 'codec': 'pcm_s16be', 'mime': 'audio/aiff'},
            'AAC': {'ext': '.aac', 'codec': 'aac', 'mime': 'audio/aac'},
            'OGG': {'ext': '.ogg', 'codec': 'libvorbis', 'mime': 'audio/ogg'},
            'M4A': {'ext': '.m4a', 'codec': 'aac', 'mime': 'audio/mp4'}
        }
        # Support all required sample rates: 22050, 44100, 48000, 96000 Hz
        self.supported_sample_rates = [22050, 44100, 48000, 96000]
        
    def is_available(self) -> bool:
        """Check if FFmpeg is available"""
        try:
            result = subprocess.run(
                ['ffmpeg', '-version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f"FFmpeg not available: {e}")
            return False
    
    async def convert_audio(
        self,
        input_path: str,
        output_format: str,
        sample_rate: int,
        bit_depth: Optional[int] = None,
        bitrate_kbps: Optional[int] = None
    ) -> str:
        """
        Convert audio file to target format and sample rate
        
        Args:
            input_path: Path to input audio file
            output_format: Target format (WAV, MP3, FLAC, etc.)
            sample_rate: Target sample rate
            bit_depth: Target bit depth (optional)
            
        Returns:
            str: Path to converted audio file
        """
        try:
            logger.info(f"Converting audio: {input_path} -> {output_format} @ {sample_rate}Hz")
            
            # Validate inputs
            if output_format not in self.supported_formats:
                raise ValueError(f"Unsupported format: {output_format}")
            
            if sample_rate not in self.supported_sample_rates:
                raise ValueError(f"Unsupported sample rate: {sample_rate}")
            
            # Create output file path
            input_name = Path(input_path).stem
            format_info = self.supported_formats[output_format]  # used for extension only
            output_path = os.path.join(
                self.temp_dir,
                f"{input_name}_converted{format_info['ext']}"
            )
            
            # Build FFmpeg command
            cmd = self._build_ffmpeg_command(
                input_path, output_path, output_format, sample_rate, bit_depth, bitrate_kbps
            )
            
            # Execute conversion
            await self._execute_ffmpeg(cmd)
            
            # Validate output file
            if not os.path.exists(output_path):
                raise Exception("Conversion failed - output file not created")
            
            # Get file size
            file_size = os.path.getsize(output_path)
            if file_size == 0:
                raise Exception("Conversion failed - output file is empty")
            
            # 🔍 DEBUG: Log FFmpeg conversion details
            input_size = os.path.getsize(input_path) if os.path.exists(input_path) else 0
            logger.info(f"🔍 DEBUG: FFmpeg conversion completed:")
            logger.info(f"🔍 DEBUG: - Input: {input_path} ({input_size} bytes)")
            logger.info(f"🔍 DEBUG: - Output: {output_path} ({file_size} bytes)")
            logger.info(f"🔍 DEBUG: - Size change: {file_size - input_size} bytes")
            logger.info(f"🔍 DEBUG: - Format: {output_format}")
            
            # Validate the converted file is not corrupted
            is_valid = await self.validate_output_file(output_path, output_format)
            if not is_valid:
                raise Exception("Conversion failed - output file is corrupted or too small")
            
            logger.info(f"Audio conversion completed: {output_path} ({file_size} bytes)")
            return output_path
            
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            raise
    
    def _build_ffmpeg_command(
        self,
        input_path: str,
        output_path: str,
        output_format: str,
        sample_rate: int,
        bit_depth: Optional[int] = None,
        bitrate_kbps: Optional[int] = None
    ) -> list:
        """Build FFmpeg command for audio conversion"""
        
        # format_info = self.supported_formats[output_format]  # not used
        
        # Base command with gain staging
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-af', 'volume=4dB',  # Apply +4 dB gain staging
            '-ar', str(sample_rate),  # Sample rate
            '-ac', '2',  # Force stereo output; preserve stereo mapping
            '-y'  # Overwrite output file
        ]
        
        # Add format-specific options
        if output_format == 'WAV':
            # Ensure 24-bit WAV by default unless explicitly overridden
            if bit_depth:
                if bit_depth == 16:
                    cmd.extend(['-acodec', 'pcm_s16le'])
                elif bit_depth == 24:
                    cmd.extend(['-acodec', 'pcm_s24le'])
                elif bit_depth == 32:
                    cmd.extend(['-acodec', 'pcm_s32le'])
                else:
                    cmd.extend(['-acodec', 'pcm_s24le'])
            else:
                cmd.extend(['-acodec', 'pcm_s24le'])
        
        elif output_format == 'MP3':
            cmd.extend([
                '-acodec', 'libmp3lame',
                '-b:a', f"{(bitrate_kbps or 320)}k",
            ])
        
        elif output_format == 'FLAC':
            cmd.extend(['-acodec', 'flac'])
            if bit_depth:
                cmd.extend(['-sample_fmt', f's{bit_depth}'])
        
        elif output_format == 'AIFF':
            # Prefer 24-bit big-endian for AIFF
            if bit_depth == 16:
                cmd.extend(['-acodec', 'pcm_s16be'])
            else:
                cmd.extend(['-acodec', 'pcm_s24be'])
        
        elif output_format == 'AAC':
            cmd.extend([
                '-acodec', 'aac',
                '-b:a', '256k',  # High quality AAC
                '-profile:a', 'aac_low'
            ])
        
        elif output_format == 'OGG':
            cmd.extend([
                '-acodec', 'libvorbis',
                '-b:a', '320k',  # High quality Vorbis
                '-q:a', '10'  # Best quality
            ])
        
        elif output_format == 'M4A':
            cmd.extend([
                '-acodec', 'aac',
                '-b:a', f"{(bitrate_kbps or 256)}k",  # High quality AAC
                '-profile:a', 'aac_low'
            ])
        
        # Add output path
        cmd.append(output_path)
        
        return cmd
    
    async def _execute_ffmpeg(self, cmd: list) -> None:
        """Execute FFmpeg command asynchronously"""
        try:
            logger.info(f"Executing FFmpeg command: {' '.join(cmd)}")
            
            # Use asyncio.get_event_loop().run_in_executor to run subprocess in thread pool
            # This avoids the NotImplementedError on Windows
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self._run_ffmpeg_sync, 
                cmd
            )
            
            if result['returncode'] != 0:
                error_msg = result['stderr'] if result['stderr'] else "Unknown FFmpeg error"
                logger.error(f"FFmpeg failed: {error_msg}")
                raise Exception(f"FFmpeg conversion failed: {error_msg}")
            
            logger.info("FFmpeg conversion completed successfully")
            
        except Exception as e:
            logger.error(f"FFmpeg execution failed: {e}")
            raise
    
    def _run_ffmpeg_sync(self, cmd: list) -> dict:
        """Run FFmpeg command synchronously in thread pool"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            return {
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
            
        except subprocess.TimeoutExpired as e:
            return {
                'returncode': -1,
                'stdout': '',
                'stderr': f"FFmpeg conversion timed out: {e}"
            }
        except Exception as e:
            return {
                'returncode': -1,
                'stdout': '',
                'stderr': f"FFmpeg execution failed: {e}"
            }

    # Note: apply_gain method removed to preserve ML mastering parameters
    # The ML mastering engine handles all gain and loudness processing correctly
    
    async def get_audio_info(self, file_path: str) -> Dict[str, Any]:
        """
        Get audio file information using FFprobe
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Dict containing audio information
        """
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                file_path
            ]
            
            # Use the same thread pool approach to avoid Windows subprocess issues
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self._run_ffprobe_sync, 
                cmd
            )
            
            if result['returncode'] != 0:
                raise Exception(f"FFprobe failed: {result['stderr']}")
            
            import json
            info = json.loads(result['stdout'])
            
            # Extract relevant information
            audio_stream = None
            for stream in info.get('streams', []):
                if stream.get('codec_type') == 'audio':
                    audio_stream = stream
                    break
            
            if not audio_stream:
                raise Exception("No audio stream found")
            
            return {
                'duration': float(info.get('format', {}).get('duration', 0)),
                'sample_rate': int(audio_stream.get('sample_rate', 0)),
                'channels': int(audio_stream.get('channels', 0)),
                'codec': audio_stream.get('codec_name', 'unknown'),
                'bit_rate': int(info.get('format', {}).get('bit_rate', 0)),
                'file_size': int(info.get('format', {}).get('size', 0))
            }
            
        except Exception as e:
            logger.error(f"Failed to get audio info: {e}")
            return {
                'duration': 0,
                'sample_rate': 0,
                'channels': 0,
                'codec': 'unknown',
                'bit_rate': 0,
                'file_size': 0
            }
    
    def _run_ffprobe_sync(self, cmd: list) -> dict:
        """Run FFprobe command synchronously in thread pool"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
            
        except subprocess.TimeoutExpired as e:
            return {
                'returncode': -1,
                'stdout': '',
                'stderr': f"FFprobe timed out: {e}"
            }
        except Exception as e:
            return {
                'returncode': -1,
                'stdout': '',
                'stderr': f"FFprobe execution failed: {e}"
            }
    
    def get_supported_formats(self) -> list:
        """Get list of supported output formats"""
        return list(self.supported_formats.keys())
    
    def get_supported_sample_rates(self) -> list:
        """Get list of supported sample rates"""
        return self.supported_sample_rates.copy()
    
    def is_format_supported(self, format_name: str) -> bool:
        """Check if format is supported"""
        return format_name in self.supported_formats
    
    def is_sample_rate_supported(self, sample_rate: int) -> bool:
        """Check if sample rate is supported"""
        return sample_rate in self.supported_sample_rates
    
    async def validate_audio_file(self, file_path: str) -> bool:
        """
        Validate audio file using FFprobe
        
        Args:
            file_path: Path to audio file
            
        Returns:
            bool: True if valid audio file
        """
        try:
            info = await self.get_audio_info(file_path)
            return (
                info['duration'] > 0 and
                info['sample_rate'] > 0 and
                info['channels'] > 0
            )
        except Exception as e:
            logger.error(f"Audio validation failed: {e}")
            return False
    
    def get_mime_type(self, format_name: str) -> str:
        """Get MIME type for audio format"""
        if format_name in self.supported_formats:
            return self.supported_formats[format_name]['mime']
        return 'application/octet-stream'
    
    async def validate_output_file(self, file_path: str, expected_format: str) -> bool:
        """
        Validate that the output file is properly converted and not corrupted
        
        Args:
            file_path: Path to output file
            expected_format: Expected format (WAV, MP3, etc.)
            
        Returns:
            bool: True if file is valid and properly sized
        """
        try:
            if not os.path.exists(file_path):
                return False
            
            # Check file size (should be in MB, not KB)
            file_size = os.path.getsize(file_path)
            if file_size < 1024:  # Less than 1KB is suspicious
                logger.error(f"Output file too small: {file_size} bytes")
                return False
            
            # Validate with FFprobe
            info = await self.get_audio_info(file_path)
            if info['duration'] <= 0 or info['sample_rate'] <= 0:
                logger.error(f"Invalid audio properties: {info}")
                return False
            
            # Check format-specific requirements
            if expected_format == 'MP3' and file_size < 10000:  # MP3 should be at least 10KB
                logger.error(f"MP3 file too small: {file_size} bytes")
                return False
            elif expected_format == 'WAV' and file_size < 100000:  # WAV should be at least 100KB
                logger.error(f"WAV file too small: {file_size} bytes")
                return False
            
            logger.info(f"Output file validation passed: {file_size} bytes, {info['duration']:.2f}s")
            return True
            
        except Exception as e:
            logger.error(f"Output file validation failed: {e}")
            return False


