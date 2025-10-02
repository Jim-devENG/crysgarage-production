from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.core.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.core.config import settings
from app.db.base import get_session
from app.models.models import AdminUser

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    is_active: bool
    is_superuser: bool
    created_at: datetime
    last_login: Optional[datetime]

class CreateUserRequest(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    is_superuser: bool = False

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
):
    """Authenticate user and return access token."""
    # Find user by username
    result = await session.execute(
        select(AdminUser).where(AdminUser.username == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await session.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: AdminUser = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@router.post("/create-user")
async def create_user(
    user_data: CreateUserRequest,
    current_user: AdminUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Create a new admin user (superuser only)."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if username already exists
    result = await session.execute(
        select(AdminUser).where(AdminUser.username == user_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Create new user
    new_user = AdminUser(
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        is_superuser=user_data.is_superuser
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    return {"id": new_user.id, "username": new_user.username, "status": "created"}

@router.post("/init-admin")
async def init_admin(session: AsyncSession = Depends(get_session)):
    """Initialize the first admin user if none exist."""
    # Check if any admin users exist
    result = await session.execute(select(AdminUser))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users already exist"
        )
    
    # Create default admin user
    admin_user = AdminUser(
        username="admin",
        email="admin@crysgarage.studio",
        password_hash=get_password_hash("admin123"),
        is_superuser=True
    )
    
    session.add(admin_user)
    await session.commit()
    await session.refresh(admin_user)
    
    return {
        "message": "Default admin user created",
        "username": "admin",
        "password": "admin123",
        "note": "Please change the password after first login"
    }
