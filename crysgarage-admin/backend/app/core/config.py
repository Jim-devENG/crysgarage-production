from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_env: str = "development"
    app_port: int = 8082
    log_level: str = "INFO"

    database_url: str = "sqlite+aiosqlite:///./admin.db"

    admin_webhook_secret: str = "changeme"
    jwt_issuer: str = "crysgarage-admin"
    jwt_audience: str = "crysgarage-admin"
    jwt_secret: str = "your-super-secret-jwt-key-change-this-in-production"

    firebase_project_id: Optional[str] = None
    firebase_client_email: Optional[str] = None
    firebase_private_key: Optional[str] = None

    # Partner allowlist for dev privileges
    partner_emails: str = "partner1@crysgarage.studio,partner2@crysgarage.studio,partner3@crysgarage.studio,partner4@crysgarage.studio,partner5@crysgarage.studio"
    partner_passwords: str = "Partner1Pass!,Partner2Pass!,Partner3Pass!,Partner4Pass!,Partner5Pass!"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
