from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey, DateTime, Float, Column
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    user_id = Column(String, primary_key=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    tier = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, nullable=True)
    firebase_uid = Column(String, nullable=True)

class Upload(Base):
    __tablename__ = "uploads"
    upload_id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    filename = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_url = Column(String, nullable=True)

class Master(Base):
    __tablename__ = "masters"
    file_id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    tier = Column(String)
    genre = Column(String)
    preset = Column(String)
    input_size = Column(Integer)
    output_size = Column(Integer)
    format = Column(String)
    sample_rate = Column(Integer)
    status = Column(String)
    ffmpeg_stderr = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    location = Column(String)
    referrer_code = Column(String)

class ErrorLog(Base):
    __tablename__ = "errors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String)
    message = Column(Text)
    traceback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReferrerSlot(Base):
    __tablename__ = "referrer_slots"
    slot_id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String, unique=True)
    created_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    enabled = Column(Boolean, default=True)
    max_uses = Column(Integer, default=0)  # 0 = unlimited
    allowed_tier_override = Column(String, nullable=True)

class ReferrerUse(Base):
    __tablename__ = "referrer_uses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    slot_id = Column(Integer, ForeignKey("referrer_slots.slot_id"))
    user_id = Column(String)
    signup_at = Column(DateTime, nullable=True)
    first_mastered_at = Column(DateTime, nullable=True)
    completed_master = Column(Boolean, default=False)

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class DevLoginAudit(Base):
    __tablename__ = "dev_login_audits"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    role = Column(String, nullable=False)  # 'dev' or 'partner'
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    device_name = Column(String, nullable=True)
    device_type = Column(String, nullable=True)  # mobile, desktop, tablet
    browser = Column(String, nullable=True)
    os = Column(String, nullable=True)
    country = Column(String, nullable=True)
    region = Column(String, nullable=True)
    city = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Visitor(Base):
    __tablename__ = "visitors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=False)  # Unique session identifier
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    device_type = Column(String, nullable=True)  # mobile, desktop, tablet
    browser = Column(String, nullable=True)
    browser_version = Column(String, nullable=True)
    os = Column(String, nullable=True)
    os_version = Column(String, nullable=True)
    country = Column(String, nullable=True)
    region = Column(String, nullable=True)
    city = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timezone = Column(String, nullable=True)
    referrer = Column(String, nullable=True)  # Where they came from
    page_views = Column(Integer, default=1)
    session_duration = Column(Integer, nullable=True)  # in seconds
    is_bot = Column(Boolean, default=False)
    is_mobile = Column(Boolean, default=False)
    screen_resolution = Column(String, nullable=True)
    language = Column(String, nullable=True)
    first_visit = Column(DateTime, default=datetime.utcnow)
    last_visit = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)