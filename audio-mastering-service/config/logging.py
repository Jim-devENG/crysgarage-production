"""
Enhanced logging configuration using structlog for structured logging.
"""
import structlog
import logging
import sys
from typing import Any, Dict


def configure_logging(level: str = "INFO") -> None:
    """
    Configure structured logging with structlog.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, level.upper()),
    )


def get_logger(name: str) -> structlog.BoundLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Structured logger instance
    """
    return structlog.get_logger(name)


# Audio processing specific logging helpers
class AudioProcessingLogger:
    """Helper class for audio processing specific logging."""
    
    def __init__(self, logger: structlog.BoundLogger):
        self.logger = logger
    
    def log_processing_start(self, user_id: str, file_name: str, file_size: int, 
                           genre: str, tier: str) -> None:
        """Log the start of audio processing."""
        self.logger.info(
            "Audio processing started",
            user_id=user_id,
            file_name=file_name,
            file_size=file_size,
            genre=genre,
            tier=tier,
            event="processing_start"
        )
    
    def log_processing_complete(self, user_id: str, file_name: str, 
                              processing_time: float, output_size: int) -> None:
        """Log successful completion of audio processing."""
        self.logger.info(
            "Audio processing completed",
            user_id=user_id,
            file_name=file_name,
            processing_time=processing_time,
            output_size=output_size,
            event="processing_complete"
        )
    
    def log_processing_error(self, user_id: str, file_name: str, 
                           error: str, processing_time: float = None) -> None:
        """Log audio processing errors."""
        self.logger.error(
            "Audio processing failed",
            user_id=user_id,
            file_name=file_name,
            error=error,
            processing_time=processing_time,
            event="processing_error"
        )
    
    def log_resource_usage(self, cpu_percent: float, memory_percent: float, 
                          disk_percent: float) -> None:
        """Log system resource usage."""
        self.logger.info(
            "System resource usage",
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            disk_percent=disk_percent,
            event="resource_usage"
        )
