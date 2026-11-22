from typing import Optional
from pydantic import BaseModel, Field


class FinancialProfileBase(BaseModel):
    monthly_salary: float = Field(..., ge=0, description="Primary monthly take-home salary in INR")
    additional_income: float = Field(0.0, ge=0, description="Secondary or freelance monthly inflow in INR")
    essential_expenses: float = Field(..., ge=0, description="Monthly non-discretionary expenses (rent, food, utilities)")
    discretionary_expenses: float = Field(0.0, ge=0, description="Monthly lifestyle & leisure expenses")
    current_savings: float = Field(0.0, ge=0, description="Liquid cash and bank savings in INR")
    investments: float = Field(0.0, ge=0, description="Total portfolio value in mutual funds, stocks, EPF, gold")
    existing_loans: float = Field(0.0, ge=0, description="Total remaining debt/loan principal outstanding")
    monthly_emi: float = Field(0.0, ge=0, description="Current total monthly loan EMI payments")
    emergency_fund: float = Field(0.0, ge=0, description="Dedicated liquid emergency reserve fund")


class FinancialProfileUpdate(BaseModel):
    monthly_salary: Optional[float] = Field(None, ge=0)
    additional_income: Optional[float] = Field(None, ge=0)
    essential_expenses: Optional[float] = Field(None, ge=0)
    discretionary_expenses: Optional[float] = Field(None, ge=0)
    current_savings: Optional[float] = Field(None, ge=0)
    investments: Optional[float] = Field(None, ge=0)
    existing_loans: Optional[float] = Field(None, ge=0)
    monthly_emi: Optional[float] = Field(None, ge=0)
    emergency_fund: Optional[float] = Field(None, ge=0)


class CalculatedMetrics(BaseModel):
    total_income: float
    total_expenses: float
    monthly_savings: float
    savings_rate: float
    net_worth: float
    debt_to_income: float
    emergency_runway_months: float


class FinancialProfileResponse(BaseModel):
    user_name: str
    profile: FinancialProfileBase
    metrics: CalculatedMetrics
    updated_at: str
