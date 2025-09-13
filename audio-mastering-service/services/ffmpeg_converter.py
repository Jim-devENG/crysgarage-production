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
            'WAV': {'ext': '.wav', 'codec': 'pcm_s16le'},
            'MP3': {'ext': '.mp3', 'codec': 'libmp3lame'},
            'FLAC': {'ext': '.flac', 'codec': 'flac'},
            'AIFF': {'ext': '.aiff', 'codec': 'pcm_s16be'},
            'AAC': {'ext': '.aac', 'codec': 'aac'},
            'OGG': {'ext': '.ogg', 'codec': 'libvorbis'}
        }
        self.supported_sample_rates = [44100, 48000, 96000, 192000]
        
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
        bit_depth: Optional[int] = None
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
            format_info = self.supported_formats[output_format]
            output_path = os.path.join(
                self.temp_dir,
                f"{input_name}_converted{format_info['ext']}"
            )
            
            # Build FFmpeg command
            cmd = self._build_ffmpeg_command(
                input_path, output_path, output_format, sample_rate, bit_depth
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
        bit_depth: Optional[int] = None
    ) -> list:
        """Build FFmpeg command for audio conversion"""
        
        format_info = self.supported_formats[output_format]
        
        # Base command
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-ar', str(sample_rate),  # Sample rate
            '-y'  # Overwrite output file
        ]
        
        # Add format-specific options
        if output_format == 'WAV':
            if bit_depth:
                if bit_depth == 16:
                    cmd.extend(['-acodec', 'pcm_s16le'])
                elif bit_depth == 24:
                    cmd.extend(['-acodec', 'pcm_s24le'])
                elif bit_depth == 32:
                    cmd.extend(['-acodec', 'pcm_s32le'])
            else:
                cmd.extend(['-acodec', 'pcm_s16le'])
        
        elif output_format == 'MP3':
            cmd.extend([
                '-acodec', 'libmp3lame',
                '-b:a', '320k',  # High quality MP3
                '-q:a', '0'  # Best quality
            ])
        
        elif output_format == 'FLAC':
            cmd.extend(['-acodec', 'flac'])
            if bit_depth:
                cmd.extend(['-sample_fmt', f's{bit_depth}'])
        
        elif output_format == 'AIFF':
            cmd.extend(['-acodec', 'pcm_s16be'])
        
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
        
        # Add output path
        cmd.append(output_path)
        
        return cmd
    
    async def _execute_ffmpeg(self, cmd: list) -> None:
        """Execute FFmpeg command asynchronously"""
        try:
            logger.info(f"Executing FFmpeg command: {' '.join(cmd)}")
            
            # Run FFmpeg in subprocess
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Wait for completion with timeout
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=300  # 5 minute timeout
            )
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"FFmpeg failed: {error_msg}")
                raise Exception(f"FFmpeg conversion failed: {error_msg}")
            
            logger.info("FFmpeg conversion completed successfully")
            
        except asyncio.TimeoutError:
            logger.error("FFmpeg conversion timed out")
            raise Exception("Audio conversion timed out")
        except Exception as e:
            logger.error(f"FFmpeg execution failed: {e}")
            raise
    
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
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=30
            )
            
            if process.returncode != 0:
                raise Exception(f"FFprobe failed: {stderr.decode()}")
            
            import json
            info = json.loads(stdout.decode())
            
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
