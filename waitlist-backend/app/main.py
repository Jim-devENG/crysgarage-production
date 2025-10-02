from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional
import uvicorn
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./waitlist.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class WaitlistUser(Base):
    __tablename__ = "waitlist_users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class WaitlistRegistration(BaseModel):
    name: str
    location: str
    phone: str
    email: EmailStr
    category: str

class WaitlistUserResponse(BaseModel):
    id: int
    name: str
    location: str
    phone: str
    email: str
    category: str
    created_at: datetime

    class Config:
        orm_mode = True

# FastAPI app
app = FastAPI(title="CrysGarage Waitlist API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.post("/api/waitlist/register", response_model=dict)
async def register_waitlist(user_data: WaitlistRegistration, db: Session = Depends(get_db)):
    """Register a new user to the waitlist"""
    try:
        # Check if email already exists
        existing_user = db.query(WaitlistUser).filter(WaitlistUser.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        db_user = WaitlistUser(
            name=user_data.name,
            location=user_data.location,
            phone=user_data.phone,
            email=user_data.email,
            category=user_data.category
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {
            "success": True,
            "message": "Successfully registered to waitlist",
            "user_id": db_user.id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.get("/api/waitlist/list", response_model=List[WaitlistUserResponse])
async def list_waitlist_users(db: Session = Depends(get_db)):
    """Get all waitlist users"""
    users = db.query(WaitlistUser).order_by(WaitlistUser.created_at.desc()).all()
    return users

@app.get("/api/waitlist/count")
async def get_waitlist_count(db: Session = Depends(get_db)):
    """Get total number of waitlist registrations"""
    count = db.query(WaitlistUser).count()
    return {"total_registrations": count}

@app.get("/api/waitlist/categories")
async def get_category_stats(db: Session = Depends(get_db)):
    """Get registration count by category"""
    from sqlalchemy import func
    categories = db.query(
        WaitlistUser.category, 
        func.count(WaitlistUser.id).label('count')
    ).group_by(WaitlistUser.category).all()
    
    return {category: count for category, count in categories}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Waitlist API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8083)
