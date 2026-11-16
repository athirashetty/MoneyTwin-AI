from fastapi import APIRouter
from app.api.v1.endpoints import health, profile, health_score, simulator, calculators

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(health_score.router, prefix="/health-score", tags=["Health Score"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["Simulator"])
api_router.include_router(calculators.router, prefix="/calculators", tags=["Calculators"])
