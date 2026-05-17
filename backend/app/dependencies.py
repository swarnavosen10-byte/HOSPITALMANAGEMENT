import os
from fastapi import Header, HTTPException
from app.database import SessionLocal

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "dev-secret-key")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_admin_key(x_api_key: str = Header(None)):
    """Verify admin API key from request header"""
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True
