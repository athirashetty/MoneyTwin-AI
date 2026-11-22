from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.ml.forecasting import CashFlowForecaster
from app.schemas.forecasting import ForecastResponse
from app.services.profile_store import profile_store

router = APIRouter()


@router.get(
    "",
    response_model=ForecastResponse,
    summary="Get ML Cash Flow Forecast",
    description=(
        "Executes a multi-month machine learning cash flow forecast using Scikit-Learn "
        "RandomForestRegressor models trained on historical transactions. "
        "Predicts future income, expenses, and net savings with automated seasonal insights."
    ),
)
def get_cash_flow_forecast(
    user_id: Optional[int] = Query(
        default=None, description="User ID to forecast. Defaults to primary active user."
    ),
    months: int = Query(
        default=6, ge=1, le=24, description="Forecast horizon in months (default: 6)"
    ),
    forecast_months: Optional[int] = Query(
        default=None, ge=1, le=24, description="Alias for months parameter"
    ),
    persist: bool = Query(
        default=True,
        description="Whether to persist predicted records into the MonthlyCashFlow table",
    ),
    db: Session = Depends(get_db),
):
    # Normalize sentinel defaults if invoked directly as a Python callable
    target_user_id = user_id if isinstance(user_id, int) else None
    horizon = forecast_months if isinstance(forecast_months, int) else months
    if not isinstance(horizon, int):
        horizon = 6

    do_persist = persist if isinstance(persist, bool) else True

    # Resolve target user
    if target_user_id is not None:
        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise HTTPException(
                status_code=404, detail=f"User with ID {target_user_id} not found."
            )
    else:
        # Default to primary active user (auto-seeds if database is empty)
        profile_store._ensure_default_profile(db)
        user = (
            db.query(User).filter(User.email == "aarav.sharma@example.com").first()
            or db.query(User).first()
        )
        if not user:
            raise HTTPException(
                status_code=404, detail="No active user profile found."
            )

    # Initialize forecaster and run ML inference
    forecaster = CashFlowForecaster(db=db)
    result = forecaster.forecast(user_id=user.id, horizon_months=horizon)

    # Persist predictions to database if requested
    if do_persist:
        forecaster.save_forecast_to_db(user_id=user.id, forecasts=result["forecasts"])
        result["persisted_to_db"] = True

    return result
