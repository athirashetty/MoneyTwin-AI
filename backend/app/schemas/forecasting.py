from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MonthlyForecastItem(BaseModel):
    month_year: str = Field(..., description="Target forecast month in YYYY-MM format")
    month_label: str = Field(..., description="Display label, e.g. Dec (Twin)")
    predicted_income: float = Field(..., ge=0, description="Projected monthly income in INR")
    predicted_expenses: float = Field(..., ge=0, description="Projected monthly expenses in INR")
    predicted_savings: float = Field(..., ge=0, description="Projected net savings in INR")
    savings_rate: float = Field(..., ge=0, le=100, description="Projected savings percentage")
    insights: List[str] = Field(default_factory=list, description="Automated qualitative financial insights")


class ForecastSummary(BaseModel):
    average_monthly_income: float = Field(..., description="Average projected monthly inflow")
    average_monthly_expenses: float = Field(..., description="Average projected monthly outflow")
    average_monthly_savings: float = Field(..., description="Average projected monthly surplus")
    average_savings_rate: float = Field(..., description="Average projected savings percentage")
    total_projected_savings: float = Field(..., description="Cumulative savings across horizon")


class ForecastResponse(BaseModel):
    user_id: int
    forecast_horizon_months: int
    historical_months_used: int
    forecasts: List[MonthlyForecastItem]
    summary: ForecastSummary
    feature_importance: Optional[Dict[str, Dict[str, float]]] = None
    persisted_to_db: bool = False
