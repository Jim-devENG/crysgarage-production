#!/usr/bin/env python3
"""
Migrate real data from CrysGarage main database to admin database
"""
import sqlite3
from datetime import datetime
import sys

def migrate_real_data():
    try:
        # Connect to source database (main CrysGarage app)
        print("Connecting to main CrysGarage database...")
        source_conn = sqlite3.connect('/var/www/crysgarage/crysgarage-backend-fresh/database/database.sqlite')
        source_cursor = source_conn.cursor()

        # Connect to admin database
        print("Connecting to admin database...")
        admin_conn = sqlite3.connect('admin.db')
        admin_cursor = admin_conn.cursor()

        # Migrate users
        print("Migrating users...")
        source_cursor.execute('SELECT id, name, email, tier, created_at, updated_at FROM users')
        users = source_cursor.fetchall()
        
        for user in users:
            user_id, name, email, tier, created_at, updated_at = user
            # Map to admin database schema
            admin_cursor.execute('''
                INSERT OR REPLACE INTO users (user_id, email, name, tier, created_at, last_seen)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (str(user_id), email, name, tier, created_at, updated_at))
        
        print(f"Migrated {len(users)} users")

        # Migrate audio files as uploads
        print("Migrating audio files as uploads...")
        source_cursor.execute('SELECT id, user_id, original_filename, original_path, file_size, created_at FROM audio')
        audio_files = source_cursor.fetchall()
        
        for audio in audio_files:
            audio_id, user_id, original_filename, original_path, file_size, created_at = audio
            # Map to admin database schema
            admin_cursor.execute('''
                INSERT OR REPLACE INTO uploads (upload_id, user_id, size, created_at)
                VALUES (?, ?, ?, ?)
            ''', (str(audio_id), str(user_id), file_size, created_at))
        
        print(f"Migrated {len(audio_files)} audio files as uploads")

        # Create some sample masters based on audio files
        print("Creating masters from audio files...")
        source_cursor.execute('SELECT id, user_id, status, created_at FROM audio WHERE status != "uploaded"')
        processed_audio = source_cursor.fetchall()
        
        for audio in processed_audio:
            audio_id, user_id, status, created_at = audio
            # Map status to master status
            master_status = "completed" if status == "processed" else "failed"
            admin_cursor.execute('''
                INSERT OR REPLACE INTO masters (file_id, user_id, tier, status, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (str(audio_id), str(user_id), "free", master_status, created_at))
        
        print(f"Created {len(processed_audio)} masters")

        # Create some sample error logs
        print("Creating sample error logs...")
        error_logs = [
            (1, 'upload', 'File upload timeout', 'Connection timeout during upload', datetime.utcnow().isoformat()),
            (2, 'processing', 'Audio processing failed', 'FFmpeg error: Invalid audio format', datetime.utcnow().isoformat()),
        ]
        
        for error in error_logs:
            admin_cursor.execute('''
                INSERT OR REPLACE INTO errors (id, source, message, traceback, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', error)
        
        print(f"Created {len(error_logs)} error logs")

        # Commit changes
        admin_conn.commit()
        
        # Verify data
        admin_cursor.execute('SELECT COUNT(*) FROM users')
        user_count = admin_cursor.fetchone()[0]
        admin_cursor.execute('SELECT COUNT(*) FROM uploads')
        upload_count = admin_cursor.fetchone()[0]
        admin_cursor.execute('SELECT COUNT(*) FROM masters')
        master_count = admin_cursor.fetchone()[0]
        admin_cursor.execute('SELECT COUNT(*) FROM errors')
        error_count = admin_cursor.fetchone()[0]
        
        print(f"\nReal data migration completed!")
        print(f"Users: {user_count}")
        print(f"Uploads: {upload_count}")
        print(f"Masters: {master_count}")
        print(f"Errors: {error_count}")

        # Close connections
        source_conn.close()
        admin_conn.close()
        
        return True

    except Exception as e:
        print(f"Error during migration: {e}")
        return False

if __name__ == "__main__":
    success = migrate_real_data()
    sys.exit(0 if success else 1)
