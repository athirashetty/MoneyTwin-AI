from fastapi import APIRouter
from app.schemas.profile import (
    FinancialProfileBase,
    FinancialProfileUpdate,
    FinancialProfileResponse,
)
from app.services.profile_store import profile_store

router = APIRouter()


@router.get("", response_model=FinancialProfileResponse, summary="Get Current Financial Profile")
def get_financial_profile():
    """
    Retrieve the current user's financial profile and auto-calculated baseline metrics.
    """
    return profile_store.get_response()


@router.post("", response_model=FinancialProfileResponse, summary="Update Financial Profile")
def update_financial_profile(update_data: FinancialProfileUpdate):
    """
    Update financial profile parameters (salary, expenses, savings, investments, loans).
    Recalculates all baseline metrics and returns the updated state.
    """
    profile_store.update_profile(update_data)
    return profile_store.get_response()
