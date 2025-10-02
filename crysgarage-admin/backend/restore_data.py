#!/usr/bin/env python3
"""
Data migration script to restore data from PostgreSQL to SQLite
"""
import psycopg2
import sqlite3
from datetime import datetime
import sys

def migrate_data():
    try:
        # Connect to PostgreSQL
        print("Connecting to PostgreSQL...")
        pg_conn = psycopg2.connect(
            host='localhost',
            database='crysgarage',
            user='crysgarage',
            password='crysgarage123'
        )
        pg_cursor = pg_conn.cursor()

        # Connect to SQLite
        print("Connecting to SQLite...")
        sqlite_conn = sqlite3.connect('admin.db')
        sqlite_cursor = sqlite_conn.cursor()

        # Migrate users
        print("Migrating users...")
        pg_cursor.execute('SELECT user_id, email, name, tier, created_at, last_seen, firebase_uid FROM users')
        users = pg_cursor.fetchall()
        
        for user in users:
            sqlite_cursor.execute('''
                INSERT OR REPLACE INTO users (user_id, email, name, tier, created_at, last_seen, firebase_uid)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', user)
        
        print(f"Migrated {len(users)} users")

        # Migrate uploads
        print("Migrating uploads...")
        pg_cursor.execute('SELECT upload_id, user_id, size, created_at FROM uploads')
        uploads = pg_cursor.fetchall()
        
        for upload in uploads:
            sqlite_cursor.execute('''
                INSERT OR REPLACE INTO uploads (upload_id, user_id, size, created_at)
                VALUES (?, ?, ?, ?)
            ''', upload)
        
        print(f"Migrated {len(uploads)} uploads")

        # Migrate masters
        print("Migrating masters...")
        pg_cursor.execute('SELECT file_id, user_id, tier, status, created_at, ffmpeg_stderr FROM masters')
        masters = pg_cursor.fetchall()
        
        for master in masters:
            sqlite_cursor.execute('''
                INSERT OR REPLACE INTO masters (file_id, user_id, tier, status, created_at, ffmpeg_stderr)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', master)
        
        print(f"Migrated {len(masters)} masters")

        # Migrate error logs
        print("Migrating error logs...")
        pg_cursor.execute('SELECT id, source, message, traceback, created_at FROM errors')
        errors = pg_cursor.fetchall()
        
        for error in errors:
            sqlite_cursor.execute('''
                INSERT OR REPLACE INTO errors (id, source, message, traceback, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', error)
        
        print(f"Migrated {len(errors)} error logs")

        # Commit changes
        sqlite_conn.commit()
        
        # Verify data
        sqlite_cursor.execute('SELECT COUNT(*) FROM users')
        user_count = sqlite_cursor.fetchone()[0]
        sqlite_cursor.execute('SELECT COUNT(*) FROM uploads')
        upload_count = sqlite_cursor.fetchone()[0]
        sqlite_cursor.execute('SELECT COUNT(*) FROM masters')
        master_count = sqlite_cursor.fetchone()[0]
        sqlite_cursor.execute('SELECT COUNT(*) FROM errors')
        error_count = sqlite_cursor.fetchone()[0]
        
        print(f"\nData migration completed!")
        print(f"Users: {user_count}")
        print(f"Uploads: {upload_count}")
        print(f"Masters: {master_count}")
        print(f"Errors: {error_count}")

        # Close connections
        pg_conn.close()
        sqlite_conn.close()
        
        return True

    except Exception as e:
        print(f"Error during migration: {e}")
        return False

if __name__ == "__main__":
    success = migrate_data()
    sys.exit(0 if success else 1)
