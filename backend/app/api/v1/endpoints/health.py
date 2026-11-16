from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Health Check")
def health_check():
    """
    Health check endpoint returning system status, timestamp, and API version.
    """
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "sqlite (local)",
        "features": {
            "financial_twin": "active",
            "simulator": "ready",
            "ai_advisor": "ready",
        },
    }
