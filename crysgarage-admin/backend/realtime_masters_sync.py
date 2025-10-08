#!/usr/bin/env python3
"""
Real-time masters sync service
Continuously syncs masters data from main CrysGarage app to admin database
"""

import asyncio
import sqlite3
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.base import get_session
from app.models.models import Master, User, Upload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/crysgarage-masters-sync.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MastersSyncService:
    def __init__(self):
        # Main app database path
        self.main_db_path = "/var/www/crysgarage/crysgarage-backend-fresh/database/database.sqlite"
        self.admin_db_path = "/var/www/crysgarage-admin/backend/admin.db"
        self.last_sync_time = None
        
    async def get_admin_session(self) -> AsyncSession:
        """Get admin database session"""
        from app.db.base import engine
        from sqlalchemy.ext.asyncio import AsyncSession
        async with AsyncSession(engine) as session:
            return session
    
    def get_main_db_connection(self):
        """Get connection to main app database"""
        if not os.path.exists(self.main_db_path):
            logger.error(f"Main database not found at {self.main_db_path}")
            return None
        return sqlite3.connect(self.main_db_path)
    
    async def sync_masters(self):
        """Sync masters from main app to admin database"""
        try:
            # Connect to main database
            main_conn = self.get_main_db_connection()
            if not main_conn:
                return False
                
            main_cursor = main_conn.cursor()
            
            # Get admin session
            from app.db.base import engine
            from sqlalchemy.ext.asyncio import AsyncSession
            async with AsyncSession(engine) as admin_session:
                
                # Query for recent audio files that have been processed
                query = """
                SELECT id, user_id, status, created_at, updated_at, 
                       file_size, genre, tier, sample_rate, format
                FROM audio 
                WHERE status IN ('processed', 'failed', 'error') 
                AND created_at > ?
                ORDER BY created_at DESC
                """
                
                # Use last sync time or 1 hour ago as fallback
                since_time = self.last_sync_time or (datetime.now() - timedelta(hours=1))
                since_str = since_time.strftime('%Y-%m-%d %H:%M:%S')
                
                main_cursor.execute(query, (since_str,))
                recent_audio = main_cursor.fetchall()
                
                logger.info(f"Found {len(recent_audio)} recent audio files to sync")
                
                synced_count = 0
                for audio in recent_audio:
                audio_id, user_id, status, created_at, updated_at, file_size, genre, tier, sample_rate, format = audio
                
                # Map status to master status
                master_status = "completed" if status == "processed" else "failed"
                
                # Check if master already exists
                existing_query = select(Master).where(Master.file_id == str(audio_id))
                existing_result = await admin_session.execute(existing_query)
                existing_master = existing_result.scalar_one_or_none()
                
                if existing_master:
                    # Update existing master
                    existing_master.status = master_status
                    existing_master.tier = tier or "free"
                    existing_master.genre = genre
                    existing_master.sample_rate = sample_rate
                    existing_master.format = format or "mp3"
                    existing_master.input_size = file_size
                    if master_status == "completed":
                        existing_master.completed_at = datetime.fromisoformat(updated_at) if updated_at else datetime.utcnow()
                    logger.info(f"Updated master {audio_id}")
                else:
                    # Create new master
                    new_master = Master(
                        file_id=str(audio_id),
                        user_id=str(user_id),
                        tier=tier or "free",
                        genre=genre,
                        input_size=file_size,
                        format=format or "mp3",
                        sample_rate=sample_rate,
                        status=master_status,
                        created_at=datetime.fromisoformat(created_at) if created_at else datetime.utcnow(),
                        completed_at=datetime.fromisoformat(updated_at) if updated_at and master_status == "completed" else None
                    )
                    admin_session.add(new_master)
                    logger.info(f"Created new master {audio_id}")
                
                synced_count += 1
            
            # Also sync uploads
            upload_query = """
            SELECT id, user_id, file_size, created_at, filename
            FROM audio 
            WHERE status = 'uploaded' 
            AND created_at > ?
            ORDER BY created_at DESC
            """
            
            main_cursor.execute(upload_query, (since_str,))
            recent_uploads = main_cursor.fetchall()
            
            for upload in recent_uploads:
                audio_id, user_id, file_size, created_at, filename = upload
                
                # Check if upload already exists
                from app.models.models import Upload
                existing_upload_query = select(Upload).where(Upload.upload_id == str(audio_id))
                existing_upload_result = await admin_session.execute(existing_upload_query)
                existing_upload = existing_upload_result.scalar_one_or_none()
                
                if not existing_upload:
                    new_upload = Upload(
                        upload_id=str(audio_id),
                        user_id=str(user_id),
                        size=file_size,
                        filename=filename,
                        created_at=datetime.fromisoformat(created_at) if created_at else datetime.utcnow()
                    )
                    admin_session.add(new_upload)
                    logger.info(f"Created new upload {audio_id}")
            
            # Commit all changes
            await admin_session.commit()
            await admin_session.close()
            
            # Update last sync time
            self.last_sync_time = datetime.now()
            
            logger.info(f"Successfully synced {synced_count} masters and {len(recent_uploads)} uploads")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing masters: {str(e)}")
            return False
        finally:
            if 'main_conn' in locals():
                main_conn.close()
    
    async def run_continuous_sync(self):
        """Run continuous sync every 30 seconds"""
        logger.info("Starting real-time masters sync service")
        
        while True:
            try:
                await self.sync_masters()
                await asyncio.sleep(30)  # Sync every 30 seconds
            except KeyboardInterrupt:
                logger.info("Sync service stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in sync loop: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error

async def main():
    """Main entry point"""
    sync_service = MastersSyncService()
    await sync_service.run_continuous_sync()

if __name__ == "__main__":
    # Use older asyncio syntax for Python 3.6 compatibility
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
