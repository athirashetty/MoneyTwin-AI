from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.profile import (
    FinancialProfileBase,
    FinancialProfileUpdate,
    FinancialProfileResponse,
)
from app.services.profile_store import profile_store

router = APIRouter()


@router.get("", response_model=FinancialProfileResponse, summary="Get Current Financial Profile")
def get_financial_profile(db: Session = Depends(get_db)):
    """
    Retrieve the current user's financial profile and auto-calculated baseline metrics
    from the persistent database.
    """
    return profile_store.get_response(db=db)


@router.post("", response_model=FinancialProfileResponse, summary="Update Financial Profile")
def update_financial_profile(
    update_data: FinancialProfileUpdate,
    db: Session = Depends(get_db),
):
    """
    Update financial profile parameters (salary, expenses, savings, investments, loans)
    in the database. Recalculates all baseline metrics and returns the updated state.
    """
    profile_store.update_profile(update=update_data, db=db)
    return profile_store.get_response(db=db)
