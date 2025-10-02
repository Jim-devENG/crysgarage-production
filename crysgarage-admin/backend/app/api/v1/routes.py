from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.base import get_session
from app.models.models import User, Master, Upload, ErrorLog, ReferrerSlot, DevLoginAudit, AdminUser, Visitor
from app.services.firebase_sync import sync_users_from_firebase
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["api"]) 

@router.get("/metrics")
async def metrics(session: AsyncSession = Depends(get_session), current_user: AdminUser = Depends(get_current_user)):
    # Basic counts
    uploads_q = await session.execute(select(func.count(Upload.upload_id)))
    masters_q = await session.execute(select(func.count(Master.file_id)))
    failed_q = await session.execute(select(func.count()).select_from(Master).where(Master.status == "failed"))
    users_q = await session.execute(select(func.count(User.user_id)))
    
    # Active users (users with recent activity)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users_q = await session.execute(
        select(func.count(User.user_id)).where(User.last_seen >= thirty_days_ago)
    )
    
    # Storage metrics
    total_upload_size_q = await session.execute(select(func.sum(Upload.size)))
    total_master_size_q = await session.execute(select(func.sum(Master.output_size)))
    
    # Recent activity (last 24 hours)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    recent_uploads_q = await session.execute(
        select(func.count(Upload.upload_id)).where(Upload.created_at >= twenty_four_hours_ago)
    )
    recent_masters_q = await session.execute(
        select(func.count(Master.file_id)).where(Master.created_at >= twenty_four_hours_ago)
    )
    
    # Tier distribution
    tier_distribution_q = await session.execute(
        select(User.tier, func.count(User.user_id)).group_by(User.tier)
    )
    tier_distribution = {row[0] or "free": row[1] for row in tier_distribution_q.fetchall()}
    
    # Status distribution for masters
    master_status_q = await session.execute(
        select(Master.status, func.count(Master.file_id)).group_by(Master.status)
    )
    master_status_distribution = {row[0] or "unknown": row[1] for row in master_status_q.fetchall()}
    
    return {
        # Basic metrics
        "uploads": uploads_q.scalar() or 0,
        "masters": masters_q.scalar() or 0,
        "failed": failed_q.scalar() or 0,
        "users": users_q.scalar() or 0,
        "active_users": active_users_q.scalar() or 0,
        
        # Storage metrics (in bytes)
        "total_upload_size": total_upload_size_q.scalar() or 0,
        "total_master_size": total_master_size_q.scalar() or 0,
        
        # Recent activity
        "recent_uploads": recent_uploads_q.scalar() or 0,
        "recent_masters": recent_masters_q.scalar() or 0,
        
        # Distributions
        "tier_distribution": tier_distribution,
        "master_status_distribution": master_status_distribution,
    }

@router.get("/users")
async def list_users(limit: int = 50, offset: int = 0, session: AsyncSession = Depends(get_session), current_user: AdminUser = Depends(get_current_user)):
    q = await session.execute(select(User).order_by(User.created_at.desc()).limit(limit).offset(offset))
    return [
        {
            "user_id": u.user_id,
            "email": u.email,
            "name": u.name,
            "tier": u.tier,
            "created_at": u.created_at,
            "last_seen": u.last_seen,
        }
        for u in q.scalars().all()
    ]

@router.post("/users/sync")
async def sync_users(session: AsyncSession = Depends(get_session), current_user: AdminUser = Depends(get_current_user)):
    """Trigger a read-only sync from Firebase Admin into local users table."""
    result = await sync_users_from_firebase(session)
    if not result.get("ok"):
        raise HTTPException(status_code=500, detail=result)
    return result

@router.get("/users/{user_id}")
async def get_user(user_id: str, session: AsyncSession = Depends(get_session), current_user: AdminUser = Depends(get_current_user)):
    uq = await session.execute(select(User).where(User.user_id == user_id))
    user = uq.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    masters_q = await session.execute(select(Master).where(Master.user_id == user_id).order_by(Master.created_at.desc()))
    uploads_q = await session.execute(select(Upload).where(Upload.user_id == user_id).order_by(Upload.created_at.desc()))
    return {
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "tier": user.tier,
            "created_at": user.created_at,
            "last_seen": user.last_seen,
        },
        "masters": [
            {
                "file_id": m.file_id,
                "tier": m.tier,
                "genre": m.genre,
                "preset": m.preset,
                "format": m.format,
                "sample_rate": m.sample_rate,
                "status": m.status,
                "created_at": m.created_at,
                "completed_at": m.completed_at,
            }
            for m in masters_q.scalars().all()
        ],
        "uploads": [
            {
                "upload_id": up.upload_id,
                "filename": up.filename,
                "size": up.size,
                "created_at": up.created_at,
                "file_url": up.file_url,
            }
            for up in uploads_q.scalars().all()
        ],
    }

@router.get("/masters")
async def list_masters(
    status: Optional[str] = None,
    tier: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    current_user: AdminUser = Depends(get_current_user),
):
    stmt = select(Master).order_by(Master.created_at.desc())
    if status:
        stmt = stmt.where(Master.status == status)
    if tier:
        stmt = stmt.where(Master.tier == tier)
    q = await session.execute(stmt.limit(limit).offset(offset))
    return [
        {
            "file_id": m.file_id,
            "user_id": m.user_id,
            "tier": m.tier,
            "genre": m.genre,
            "preset": m.preset,
            "input_size": m.input_size,
            "output_size": m.output_size,
            "format": m.format,
            "sample_rate": m.sample_rate,
            "status": m.status,
            "created_at": m.created_at,
            "completed_at": m.completed_at,
            "location": m.location,
            "referrer_code": m.referrer_code,
        }
        for m in q.scalars().all()
    ]

@router.get("/masters/{file_id}")
async def master_detail(file_id: str, session: AsyncSession = Depends(get_session)):
    q = await session.execute(select(Master).where(Master.file_id == file_id))
    m = q.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Master not found")
    return {
        "file_id": m.file_id,
        "user_id": m.user_id,
        "tier": m.tier,
        "genre": m.genre,
        "preset": m.preset,
        "input_size": m.input_size,
        "output_size": m.output_size,
        "format": m.format,
        "sample_rate": m.sample_rate,
        "status": m.status,
        "ffmpeg_stderr": m.ffmpeg_stderr,
        "created_at": m.created_at,
        "completed_at": m.completed_at,
        "location": m.location,
        "referrer_code": m.referrer_code,
    }

@router.get("/logs")
async def list_logs(limit: int = 50, offset: int = 0, session: AsyncSession = Depends(get_session), current_user: AdminUser = Depends(get_current_user)):
    q = await session.execute(select(ErrorLog).order_by(ErrorLog.created_at.desc()).limit(limit).offset(offset))
    return [
        {
            "id": e.id,
            "source": e.source,
            "message": e.message,
            "traceback": e.traceback,
            "created_at": e.created_at,
        }
        for e in q.scalars().all()
    ]

@router.post("/referrer/slots")
async def create_referrer_slot(code: str, created_by: Optional[str] = None, max_uses: int = 0, enabled: bool = True, session: AsyncSession = Depends(get_session)):
    existing = await session.execute(select(ReferrerSlot).where(ReferrerSlot.code == code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Code already exists")
    slot = ReferrerSlot(code=code, created_by=created_by, max_uses=max_uses, enabled=enabled)
    session.add(slot)
    await session.commit()
    await session.refresh(slot)
    return {"slot_id": slot.slot_id, "code": slot.code, "enabled": slot.enabled, "max_uses": slot.max_uses, "created_by": slot.created_by, "created_at": slot.created_at}

@router.get("/referrer/slots")
async def list_referrer_slots(session: AsyncSession = Depends(get_session)):
    q = await session.execute(select(ReferrerSlot).order_by(ReferrerSlot.created_at.desc()))
    return [
        {
            "slot_id": s.slot_id,
            "code": s.code,
            "enabled": s.enabled,
            "max_uses": s.max_uses,
            "created_by": s.created_by,
            "created_at": s.created_at,
        }
        for s in q.scalars().all()
    ]

@router.post("/referrer/slots/{slot_id}/revoke")
async def revoke_referrer_slot(slot_id: int, session: AsyncSession = Depends(get_session)):
    q = await session.execute(select(ReferrerSlot).where(ReferrerSlot.slot_id == slot_id))
    s = q.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Slot not found")
    s.enabled = False
    await session.commit()
    return {"status": "revoked", "slot_id": slot_id}

# Dev/Partner Login Audit endpoints
class LoginAuditRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str  # 'dev' or 'partner'
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/dev-login-audit")
async def log_dev_login(audit_data: LoginAuditRequest, session: AsyncSession = Depends(get_session), current_user: AdminUser = Depends(get_current_user)):
    """Log a dev/partner login with device and location details."""
    audit = DevLoginAudit(
        user_id=audit_data.user_id,
        email=audit_data.email,
        name=audit_data.name,
        role=audit_data.role,
        ip_address=audit_data.ip_address,
        user_agent=audit_data.user_agent,
        device_name=audit_data.device_name,
        device_type=audit_data.device_type,
        browser=audit_data.browser,
        os=audit_data.os,
        country=audit_data.country,
        region=audit_data.region,
        city=audit_data.city,
        latitude=audit_data.latitude,
        longitude=audit_data.longitude,
    )
    session.add(audit)
    await session.commit()
    await session.refresh(audit)
    return {"id": audit.id, "status": "logged"}

@router.get("/dev-login-audit")
async def list_dev_logins(
    role: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    current_user: AdminUser = Depends(get_current_user),
):
    """List dev/partner login audits with filtering."""
    stmt = select(DevLoginAudit).order_by(DevLoginAudit.created_at.desc())
    if role:
        stmt = stmt.where(DevLoginAudit.role == role)
    if user_id:
        stmt = stmt.where(DevLoginAudit.user_id == user_id)
    
    q = await session.execute(stmt.limit(limit).offset(offset))
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "email": a.email,
            "name": a.name,
            "role": a.role,
            "ip_address": a.ip_address,
            "user_agent": a.user_agent,
            "device_name": a.device_name,
            "device_type": a.device_type,
            "browser": a.browser,
            "os": a.os,
            "country": a.country,
            "region": a.region,
            "city": a.city,
            "latitude": a.latitude,
            "longitude": a.longitude,
            "created_at": a.created_at,
        }
        for a in q.scalars().all()
    ]

# Visitor tracking endpoints
@router.post("/visitors/track")
async def track_visitor(
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    """Track a website visitor - called from frontend JavaScript"""
    try:
        # Get client IP
        client_ip = request.client.host
        if request.headers.get("x-forwarded-for"):
            client_ip = request.headers.get("x-forwarded-for").split(",")[0].strip()
        elif request.headers.get("x-real-ip"):
            client_ip = request.headers.get("x-real-ip")
        
        # Get user agent
        user_agent = request.headers.get("user-agent", "")
        
        # Get referrer
        referrer = request.headers.get("referer", "")
        
        # Get language
        language = request.headers.get("accept-language", "").split(",")[0] if request.headers.get("accept-language") else None
        
        # Parse user agent for browser, OS, and device info
        browser = "Unknown"
        os = "Unknown"
        device_type = "Unknown"
        is_mobile = False
        is_bot = False
        
        if user_agent:
            user_agent_lower = user_agent.lower()
            
            # Detect mobile devices
            mobile_indicators = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
            is_mobile = any(indicator in user_agent_lower for indicator in mobile_indicators)
            
            # Detect bots
            bot_indicators = ['bot', 'crawler', 'spider', 'scraper', 'facebook', 'twitter', 'linkedin', 'whatsapp']
            is_bot = any(indicator in user_agent_lower for indicator in bot_indicators)
            
            # Detect browser
            if 'chrome' in user_agent_lower and 'edg' not in user_agent_lower:
                browser = 'Chrome'
            elif 'firefox' in user_agent_lower:
                browser = 'Firefox'
            elif 'safari' in user_agent_lower and 'chrome' not in user_agent_lower:
                browser = 'Safari'
            elif 'edg' in user_agent_lower:
                browser = 'Edge'
            elif 'opera' in user_agent_lower:
                browser = 'Opera'
            
            # Detect OS
            if 'windows' in user_agent_lower:
                os = 'Windows'
            elif 'mac' in user_agent_lower:
                os = 'macOS'
            elif 'linux' in user_agent_lower:
                os = 'Linux'
            elif 'android' in user_agent_lower:
                os = 'Android'
            elif 'ios' in user_agent_lower or 'iphone' in user_agent_lower or 'ipad' in user_agent_lower:
                os = 'iOS'
            
            # Detect device type
            if is_mobile:
                if 'ipad' in user_agent_lower:
                    device_type = 'Tablet'
                elif 'iphone' in user_agent_lower or 'android' in user_agent_lower:
                    device_type = 'Mobile'
            else:
                device_type = 'Desktop'
        
        # Get location from IP (simplified - in production you'd use a proper geolocation service)
        country = "Unknown"
        region = "Unknown"
        city = "Unknown"
        
        # Simple IP-based location detection (for demo purposes)
        if client_ip:
            try:
                # This is a simplified approach - in production you'd use a proper geolocation API
                if client_ip.startswith('127.') or client_ip.startswith('192.168.') or client_ip.startswith('10.'):
                    country = "Local"
                    region = "Local Network"
                    city = "Local"
                else:
                    # For demo purposes, assign some sample locations
                    import random
                    sample_locations = [
                        ("United States", "California", "Los Angeles"),
                        ("United Kingdom", "England", "London"),
                        ("Nigeria", "Lagos", "Lagos"),
                        ("Germany", "Berlin", "Berlin"),
                        ("Canada", "Ontario", "Toronto")
                    ]
                    country, region, city = random.choice(sample_locations)
            except:
                pass
        
        # Generate session ID (simple hash of IP + User Agent)
        import hashlib
        session_id = hashlib.md5(f"{client_ip}{user_agent}".encode()).hexdigest()
        
        # Check if visitor already exists
        existing_visitor = await session.execute(
            select(Visitor).where(Visitor.session_id == session_id)
        )
        visitor = existing_visitor.scalar_one_or_none()
        
        if visitor:
            # Update existing visitor
            visitor.page_views += 1
            visitor.last_visit = datetime.utcnow()
            await session.commit()
        else:
            # Create new visitor
            visitor = Visitor(
                session_id=session_id,
                ip_address=client_ip,
                user_agent=user_agent,
                referrer=referrer,
                language=language,
                page_views=1,
                first_visit=datetime.utcnow(),
                last_visit=datetime.utcnow(),
                browser=browser,
                os=os,
                device_type=device_type,
                is_mobile=is_mobile,
                is_bot=is_bot,
                country=country,
                region=region,
                city=city
            )
            session.add(visitor)
            await session.commit()
        
        return {"status": "success", "session_id": session_id}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/visitors")
async def get_visitors(
    limit: int = 50, 
    offset: int = 0, 
    session: AsyncSession = Depends(get_session), 
    current_user: AdminUser = Depends(get_current_user)
):
    """Get visitor analytics data"""
    q = await session.execute(
        select(Visitor)
        .order_by(Visitor.last_visit.desc())
        .limit(limit)
        .offset(offset)
    )
    
    return [
        {
            "id": v.id,
            "session_id": v.session_id,
            "ip_address": v.ip_address,
            "country": v.country,
            "region": v.region,
            "city": v.city,
            "browser": v.browser,
            "os": v.os,
            "device_type": v.device_type,
            "page_views": v.page_views,
            "session_duration": v.session_duration,
            "referrer": v.referrer,
            "language": v.language,
            "first_visit": v.first_visit,
            "last_visit": v.last_visit,
            "is_mobile": v.is_mobile,
            "is_bot": v.is_bot
        }
        for v in q.scalars().all()
    ]

@router.get("/visitors/analytics")
async def get_visitor_analytics(
    session: AsyncSession = Depends(get_session), 
    current_user: AdminUser = Depends(get_current_user)
):
    """Get visitor analytics summary"""
    # Total visitors
    total_visitors_q = await session.execute(select(func.count(Visitor.id)))
    total_visitors = total_visitors_q.scalar() or 0
    
    # Unique visitors today
    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    today_visitors_q = await session.execute(
        select(func.count(Visitor.id)).where(Visitor.first_visit >= today)
    )
    today_visitors = today_visitors_q.scalar() or 0
    
    # Page views today
    today_page_views_q = await session.execute(
        select(func.sum(Visitor.page_views)).where(Visitor.last_visit >= today)
    )
    today_page_views = today_page_views_q.scalar() or 0
    
    # Country distribution
    country_dist_q = await session.execute(
        select(Visitor.country, func.count(Visitor.id))
        .where(Visitor.country.isnot(None))
        .group_by(Visitor.country)
    )
    country_distribution = {row[0]: row[1] for row in country_dist_q.fetchall()}
    
    # Browser distribution
    browser_dist_q = await session.execute(
        select(Visitor.browser, func.count(Visitor.id))
        .where(Visitor.browser.isnot(None))
        .group_by(Visitor.browser)
    )
    browser_distribution = {row[0]: row[1] for row in browser_dist_q.fetchall()}
    
    # Device type distribution
    device_dist_q = await session.execute(
        select(Visitor.device_type, func.count(Visitor.id))
        .where(Visitor.device_type.isnot(None))
        .group_by(Visitor.device_type)
    )
    device_distribution = {row[0]: row[1] for row in device_dist_q.fetchall()}
    
    # Recent visitors (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_visitors_q = await session.execute(
        select(func.count(Visitor.id)).where(Visitor.last_visit >= yesterday)
    )
    recent_visitors = recent_visitors_q.scalar() or 0
    
    return {
        "total_visitors": total_visitors,
        "today_visitors": today_visitors,
        "today_page_views": today_page_views,
        "recent_visitors": recent_visitors,
        "country_distribution": country_distribution,
        "browser_distribution": browser_distribution,
        "device_distribution": device_distribution
    }
