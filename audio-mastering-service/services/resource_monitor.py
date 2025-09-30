"""
Resource monitoring service using psutil for system monitoring.
"""
import psutil
import asyncio
from typing import Dict, Optional
from config.logging import get_logger

logger = get_logger(__name__)


class ResourceMonitor:
    """Monitor system resources during audio processing."""
    
    def __init__(self):
        self.logger = logger
    
    def get_system_stats(self) -> Dict[str, float]:
        """
        Get current system resource statistics.
        
        Returns:
            Dictionary with CPU, memory, and disk usage percentages
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            stats = {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024**3)
            }
            
            return stats
        except Exception as e:
            self.logger.error("Failed to get system stats", error=str(e))
            return {}
    
    def check_resource_limits(self, 
                            max_cpu: float = 80.0, 
                            max_memory: float = 80.0,
                            max_disk: float = 90.0) -> Dict[str, bool]:
        """
        Check if system resources are within acceptable limits.
        
        Args:
            max_cpu: Maximum CPU usage percentage
            max_memory: Maximum memory usage percentage  
            max_disk: Maximum disk usage percentage
            
        Returns:
            Dictionary with resource status checks
        """
        stats = self.get_system_stats()
        
        if not stats:
            return {'cpu_ok': False, 'memory_ok': False, 'disk_ok': False}
        
        checks = {
            'cpu_ok': stats.get('cpu_percent', 0) <= max_cpu,
            'memory_ok': stats.get('memory_percent', 0) <= max_memory,
            'disk_ok': stats.get('disk_percent', 0) <= max_disk
        }
        
        # Log warning if any resource is over limit
        if not all(checks.values()):
            self.logger.warning(
                "Resource limits exceeded",
                cpu_percent=stats.get('cpu_percent'),
                memory_percent=stats.get('memory_percent'),
                disk_percent=stats.get('disk_percent'),
                checks=checks,
                event="resource_limit_exceeded"
            )
        
        return checks
    
    def log_resource_usage(self) -> None:
        """Log current resource usage."""
        stats = self.get_system_stats()
        if stats:
            self.logger.info(
                "System resource usage",
                **stats,
                event="resource_usage"
            )
    
    async def monitor_during_processing(self, 
                                      processing_func,
                                      *args, 
                                      **kwargs) -> any:
        """
        Monitor resources during audio processing.
        
        Args:
            processing_func: The function to monitor
            *args: Arguments for the processing function
            **kwargs: Keyword arguments for the processing function
            
        Returns:
            Result of the processing function
        """
        # Log initial resource state
        self.log_resource_usage()
        
        # Check if we should proceed
        checks = self.check_resource_limits()
        if not checks['memory_ok']:
            raise RuntimeError("Insufficient memory for processing")
        
        try:
            # Start processing
            result = await processing_func(*args, **kwargs)
            
            # Log final resource state
            self.log_resource_usage()
            
            return result
            
        except Exception as e:
            # Log error with resource context
            stats = self.get_system_stats()
            self.logger.error(
                "Processing failed with resource context",
                error=str(e),
                **stats,
                event="processing_error_with_resources"
            )
            raise


# Global resource monitor instance
resource_monitor = ResourceMonitor()
