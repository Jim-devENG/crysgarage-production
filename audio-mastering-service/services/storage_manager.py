"""
Storage Manager Service
Handles file uploads to S3 or local storage
"""

import os
import asyncio
import aiofiles
from typing import Dict, Any, Optional
import logging
from datetime import datetime, timedelta
import hashlib
import mimetypes
import time

# Optional S3 imports (install boto3 if using S3)
try:
    import boto3
    from botocore.exceptions import ClientError
    S3_AVAILABLE = True
except ImportError:
    S3_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("boto3 not available - S3 storage disabled")

logger = logging.getLogger(__name__)

class StorageManager:
    """Manages file storage (S3 or local) with automatic cleanup"""
    
    def __init__(self):
        self.storage_type = os.getenv('STORAGE_TYPE', 'local')  # 'local' or 's3'
        self.local_storage_path = os.getenv('LOCAL_STORAGE_PATH', '../crysgarage-backend-fresh/storage/app/public/mastered')
        self.s3_bucket = os.getenv('S3_BUCKET', 'crysgarage-mastered-audio')
        self.s3_region = os.getenv('S3_REGION', 'us-east-1')
        # Public base URL for serving mastered files
        self.base_url = os.getenv('BASE_URL', 'http://localhost:8002')
        
        # File cleanup settings
        self.cleanup_delay_minutes = int(os.getenv('FILE_CLEANUP_DELAY_MINUTES', '5'))
        self.file_timestamps = {}  # Track when files were created for cleanup
        
        # Initialize storage
        self._initialize_storage()
        
        # Initialize S3 client if needed
        if self.storage_type == 's3' and S3_AVAILABLE:
            self.s3_client = boto3.client(
                's3',
                region_name=self.s3_region
            )
        else:
            self.s3_client = None
            
        # Cleanup task will be started when FastAPI app starts
        self._cleanup_task = None
    
    def start_cleanup_task(self):
        """Start background cleanup task - call this after FastAPI app starts"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_old_files())
    
    async def _cleanup_old_files(self):
        """Background task to clean up old files"""
        while True:
            try:
                await asyncio.sleep(60)  # Check every minute
                current_time = time.time()
                files_to_delete = []
                
                # Check files that are older than cleanup_delay_minutes
                for file_url, timestamp in self.file_timestamps.items():
                    if current_time - timestamp > (self.cleanup_delay_minutes * 60):
                        files_to_delete.append(file_url)
                
                # Delete old files
                for file_url in files_to_delete:
                    try:
                        await self.delete_file(file_url)
                        logger.info(f"Auto-deleted old file: {file_url}")
                        del self.file_timestamps[file_url]
                    except Exception as e:
                        logger.error(f"Failed to auto-delete file {file_url}: {e}")
                        
            except Exception as e:
                logger.error(f"Cleanup task error: {e}")
                await asyncio.sleep(60)  # Wait before retrying
    
    def is_available(self) -> bool:
        """Check if storage service is available"""
        try:
            if self.storage_type == 's3':
                if not S3_AVAILABLE or not self.s3_client:
                    return False
                # Test S3 connection
                self.s3_client.head_bucket(Bucket=self.s3_bucket)
                return True
            else:
                # Test local storage
                return os.path.exists(self.local_storage_path) and os.access(self.local_storage_path, os.W_OK)
        except Exception as e:
            logger.error(f"Storage service not available: {e}")
            return False
    
    def _initialize_storage(self):
        """Initialize storage directory"""
        try:
            if self.storage_type == 'local':
                os.makedirs(self.local_storage_path, exist_ok=True)
                logger.info(f"Local storage initialized: {self.local_storage_path}")
            elif self.storage_type == 's3':
                logger.info(f"S3 storage configured: {self.s3_bucket}")
        except Exception as e:
            logger.error(f"Failed to initialize storage: {e}")
            raise
    
    async def upload_file(
        self,
        file_path: str,
        user_id: int,
        format: str,
        metadata: Optional[Dict[str, Any]] = None,
        is_preview: bool = False
    ) -> str:
        """
        Upload file to storage
        
        Args:
            file_path: Path to file to upload
            user_id: User ID
            format: Audio format
            metadata: Additional metadata
            is_preview: Whether this is a preview file
            
        Returns:
            str: URL of uploaded file
        """
        try:
            logger.info(f"Uploading file: {file_path} for user {user_id} (preview: {is_preview})")
            
            # Generate unique filename
            filename = self._generate_filename(user_id, format, is_preview)
            
            if self.storage_type == 's3':
                url = await self._upload_to_s3(file_path, filename, metadata)
            else:
                url = await self._upload_to_local(file_path, filename, metadata)
            
            # Track file timestamp for cleanup
            self.file_timestamps[url] = time.time()
            logger.info(f"File uploaded successfully: {url} (will auto-delete in {self.cleanup_delay_minutes} minutes)")
            return url
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise
    
    def _generate_filename(self, user_id: int, format: str, is_preview: bool = False) -> str:
        """Generate unique filename"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        random_suffix = hashlib.md5(f"{user_id}_{timestamp}".encode()).hexdigest()[:8]
        prefix = "preview" if is_preview else "mastered"
        return f"{prefix}_user_{user_id}_{timestamp}_{random_suffix}.{format.lower()}"
    
    async def _upload_to_s3(self, file_path: str, filename: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Upload file to S3"""
        try:
            if not self.s3_client:
                raise Exception("S3 client not initialized")
            
            # Prepare metadata
            extra_args = {}
            if metadata:
                extra_args['Metadata'] = {str(k): str(v) for k, v in metadata.items()}
            
            # Set content type
            content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            extra_args['ContentType'] = content_type
            
            # Upload file
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.upload_file(
                    file_path,
                    self.s3_bucket,
                    filename,
                    ExtraArgs=extra_args
                )
            )
            
            # Generate URL
            url = f"https://{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/{filename}"
            return url
            
        except Exception as e:
            logger.error(f"S3 upload failed: {e}")
            raise
    
    async def _upload_to_local(self, file_path: str, filename: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Upload file to local storage"""
        try:
            # Create mastered directory (Laravel storage structure)
            os.makedirs(self.local_storage_path, exist_ok=True)
            
            # Destination path
            dest_path = os.path.join(self.local_storage_path, filename)
            
            # Copy file
            async with aiofiles.open(file_path, 'rb') as src:
                async with aiofiles.open(dest_path, 'wb') as dst:
                    while chunk := await src.read(8192):
                        await dst.write(chunk)
            
            # Save metadata if provided
            if metadata:
                metadata_path = dest_path + '.meta'
                async with aiofiles.open(metadata_path, 'w') as f:
                    import json
                    await f.write(json.dumps(metadata, indent=2))
            
            # Generate public URL served by Nginx alias at /files/
            url = f"{self.base_url}/files/{filename}"
            return url
            
        except Exception as e:
            logger.error(f"Local upload failed: {e}")
            raise
    
    async def delete_file(self, file_url: str) -> bool:
        """
        Delete file from storage
        
        Args:
            file_url: URL of file to delete
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            logger.info(f"Deleting file: {file_url}")
            
            if self.storage_type == 's3':
                success = await self._delete_from_s3(file_url)
            else:
                success = await self._delete_from_local(file_url)
            
            if success:
                # Remove from tracking dictionary
                if file_url in self.file_timestamps:
                    del self.file_timestamps[file_url]
                logger.info(f"File deleted successfully: {file_url}")
            else:
                logger.warning(f"File deletion failed: {file_url}")
            
            return success
            
        except Exception as e:
            logger.error(f"File deletion failed: {e}")
            return False
    
    async def _delete_from_s3(self, file_url: str) -> bool:
        """Delete file from S3"""
        try:
            if not self.s3_client:
                return False
            
            # Extract key from URL
            key = file_url.split(f"{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/")[-1]
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.delete_object(Bucket=self.s3_bucket, Key=key)
            )
            
            return True
            
        except Exception as e:
            logger.error(f"S3 deletion failed: {e}")
            return False
    
    async def _delete_from_local(self, file_url: str) -> bool:
        """Delete file from local storage"""
        try:
            # Extract path from URL
            path_part = file_url.split('/files/')[-1]
            file_path = os.path.join(self.local_storage_path, path_part)
            
            if os.path.exists(file_path):
                os.remove(file_path)
                
                # Also remove metadata file if it exists
                metadata_path = file_path + '.meta'
                if os.path.exists(metadata_path):
                    os.remove(metadata_path)
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Local deletion failed: {e}")
            return False
    
    async def get_file_info(self, file_url: str) -> Optional[Dict[str, Any]]:
        """
        Get file information
        
        Args:
            file_url: URL of file
            
        Returns:
            Dict with file information or None if not found
        """
        try:
            if self.storage_type == 's3':
                return await self._get_s3_file_info(file_url)
            else:
                return await self._get_local_file_info(file_url)
                
        except Exception as e:
            logger.error(f"Failed to get file info: {e}")
            return None
    
    async def _get_s3_file_info(self, file_url: str) -> Optional[Dict[str, Any]]:
        """Get S3 file information"""
        try:
            if not self.s3_client:
                return None
            
            # Extract key from URL
            key = file_url.split(f"{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/")[-1]
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.head_object(Bucket=self.s3_bucket, Key=key)
            )
            
            return {
                'size': response.get('ContentLength', 0),
                'last_modified': response.get('LastModified'),
                'content_type': response.get('ContentType'),
                'metadata': response.get('Metadata', {})
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return None
            raise
    
    async def _get_local_file_info(self, file_url: str) -> Optional[Dict[str, Any]]:
        """Get local file information"""
        try:
            # Extract path from URL
            path_part = file_url.split('/files/')[-1]
            file_path = os.path.join(self.local_storage_path, path_part)
            
            if not os.path.exists(file_path):
                return None
            
            stat = os.stat(file_path)
            
            info = {
                'size': stat.st_size,
                'last_modified': datetime.fromtimestamp(stat.st_mtime),
                'content_type': mimetypes.guess_type(file_path)[0]
            }
            
            # Load metadata if available
            metadata_path = file_path + '.meta'
            if os.path.exists(metadata_path):
                async with aiofiles.open(metadata_path, 'r') as f:
                    import json
                    metadata = json.loads(await f.read())
                    info['metadata'] = metadata
            
            return info
            
        except Exception as e:
            logger.error(f"Failed to get local file info: {e}")
            return None
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        try:
            if self.storage_type == 's3':
                stats = self._get_s3_stats()
            else:
                stats = self._get_local_stats()
            
            # Add cleanup information
            stats.update({
                "cleanup_enabled": True,
                "cleanup_delay_minutes": self.cleanup_delay_minutes,
                "tracked_files": len(self.file_timestamps),
                "files_scheduled_for_cleanup": len([
                    url for url, timestamp in self.file_timestamps.items()
                    if time.time() - timestamp > (self.cleanup_delay_minutes * 60)
                ])
            })
            
            return stats
        except Exception as e:
            logger.error(f"Failed to get storage stats: {e}")
            return {}
    
    def _get_s3_stats(self) -> Dict[str, Any]:
        """Get S3 storage statistics"""
        # This would require additional S3 API calls
        # For now, return basic info
        return {
            'type': 's3',
            'bucket': self.s3_bucket,
            'region': self.s3_region
        }
    
    def _get_local_stats(self) -> Dict[str, Any]:
        """Get local storage statistics"""
        try:
            total_size = 0
            file_count = 0
            
            for root, dirs, files in os.walk(self.local_storage_path):
                for file in files:
                    if not file.endswith('.meta'):
                        file_path = os.path.join(root, file)
                        total_size += os.path.getsize(file_path)
                        file_count += 1
            
            return {
                'type': 'local',
                'path': self.local_storage_path,
                'total_size': total_size,
                'file_count': file_count,
                'available_space': self._get_available_space()
            }
        except Exception as e:
            logger.error(f"Failed to get local stats: {e}")
            return {}
    
    def _get_available_space(self) -> int:
        """Get available disk space"""
        try:
            stat = os.statvfs(self.local_storage_path)
            return stat.f_bavail * stat.f_frsize
        except Exception:
            return 0

