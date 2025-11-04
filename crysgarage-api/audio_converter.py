"""
Simple Audio Converter for CrysGarage
Converts audio files between different formats and sample rates
"""

import os
import logging
from pydub import AudioSegment

logger = logging.getLogger(__name__)


class AudioConverter:
    """Convert audio files to different formats and sample rates"""
    
    def __init__(self):
        self.supported_formats = ["MP3", "WAV", "FLAC", "AAC", "OGG"]
        logger.info("AudioConverter initialized")
    
    def convert_audio(self, input_path: str, output_path: str, output_format: str, sample_rate: int = 44100):
        """
        Convert audio file to specified format and sample rate with robust validation
        
        Args:
            input_path: Path to input audio file
            output_path: Path to save converted audio
            output_format: Output format (MP3, WAV, FLAC, AAC, OGG)
            sample_rate: Target sample rate (default 44100)
            
        Returns:
            str: Path to converted file
        """
        try:
            logger.info(f"🔄 Converting {input_path} to {output_format} at {sample_rate}Hz")
            
            # Verify input file exists and has content
            if not os.path.exists(input_path):
                raise ValueError(f"Input file does not exist: {input_path}")
            
            input_size = os.path.getsize(input_path)
            logger.info(f"📊 Input file size: {input_size / (1024*1024):.2f} MB")
            
            if input_size < 100:
                raise ValueError(f"Input file too small ({input_size} bytes), possibly corrupted")
            
            # Load audio file
            logger.info(f"📂 Loading audio for conversion...")
            audio = AudioSegment.from_file(input_path)
            logger.info(f"✓ Loaded: duration={len(audio)/1000:.2f}s, channels={audio.channels}, frame_rate={audio.frame_rate}Hz")
            
            # Resample if needed
            if audio.frame_rate != sample_rate:
                logger.info(f"🔄 Resampling from {audio.frame_rate}Hz to {sample_rate}Hz...")
                audio = audio.set_frame_rate(sample_rate)
                logger.info(f"✓ Resampled to {sample_rate}Hz")
            
            # Export in requested format with explicit parameters
            format_lower = output_format.lower()
            logger.info(f"💾 Exporting to {format_lower} format...")
            
            if format_lower == "mp3":
                export_handle = audio.export(output_path, format="mp3", bitrate="320k", parameters=["-q:a", "0"])
            elif format_lower == "wav":
                export_handle = audio.export(output_path, format="wav")
            elif format_lower == "flac":
                export_handle = audio.export(output_path, format="flac", parameters=["-compression_level", "5"])
            elif format_lower == "aac":
                export_handle = audio.export(output_path, format="adts", codec="aac", bitrate="256k")
            elif format_lower == "ogg":
                export_handle = audio.export(output_path, format="ogg", codec="libvorbis", parameters=["-q:a", "6"])
            else:
                raise ValueError(f"Unsupported format: {output_format}")
            
            # Ensure the export handle is closed and data is flushed
            if export_handle:
                export_handle.close()
            
            # Force sync to disk
            if os.path.exists(output_path):
                # Touch the file to ensure it's accessible and flushed
                with open(output_path, 'rb') as f:
                    f.read(1)
                if hasattr(os, 'sync'):
                    os.sync()
            
            # Validate output file
            if not os.path.exists(output_path):
                raise ValueError(f"Output file was not created: {output_path}")
            
            output_size = os.path.getsize(output_path)
            if output_size < 100:
                raise ValueError(f"Output file is too small ({output_size} bytes), conversion may have failed")
            
            logger.info(f"✅ Conversion complete: {output_path}")
            logger.info(f"📊 Output file size: {output_size / (1024*1024):.2f} MB ({output_size} bytes)")
            
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Audio conversion failed: {e}", exc_info=True)
            # Fallback: just copy the file if conversion fails
            import shutil
            logger.warning(f"⚠️ Conversion failed, copying original file instead")
            shutil.copy2(input_path, output_path)
            
            # Validate fallback
            if os.path.exists(output_path):
                if hasattr(os, 'sync'):
                    os.sync()
                output_size = os.path.getsize(output_path)
                logger.info(f"✅ Fallback copy complete: {output_size / (1024*1024):.2f} MB")
            
            return output_path

