from pydantic import BaseModel, Field


class EMIRequest(BaseModel):
    principal: float = Field(..., gt=0, description="Loan principal amount in INR")
    annual_interest_rate: float = Field(..., ge=0, description="Annual interest rate percentage (e.g. 8.5 for 8.5%)")
    tenure_months: int = Field(..., gt=0, description="Loan tenure in months")


class EMIResponse(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_months: int
    monthly_emi: float
    total_interest: float
    total_payment: float


class SIPRequest(BaseModel):
    monthly_investment: float = Field(..., gt=0, description="Monthly SIP installment in INR")
    annual_return_rate: float = Field(..., ge=0, description="Expected annual return percentage (e.g. 12.0 for 12%)")
    tenure_years: float = Field(..., gt=0, description="Investment horizon in years")


class SIPResponse(BaseModel):
    monthly_investment: float
    annual_return_rate: float
    tenure_years: float
    total_invested: float
    estimated_returns: float
    future_value: float
