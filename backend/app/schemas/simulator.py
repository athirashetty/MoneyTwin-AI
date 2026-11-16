from typing import List, Optional
from pydantic import BaseModel, Field


class SimulationScenario(BaseModel):
    monthly_salary: Optional[float] = Field(None, ge=0, description="Override for total monthly salary; if omitted, baseline is used")
    monthly_expenses: Optional[float] = Field(None, ge=0, description="Override for monthly essential + discretionary expenses; if omitted, baseline is used")
    new_loan_amount: float = Field(0.0, ge=0, description="New prospective loan principal in INR")
    new_loan_interest_rate: float = Field(8.5, ge=0, description="Annual interest rate for new loan (%)")
    loan_tenure_months: int = Field(48, gt=0, description="New loan tenure in months")
    monthly_sip_investment: float = Field(0.0, ge=0, description="Additional monthly SIP wealth allocation in INR")


class SituationMetrics(BaseModel):
    monthly_income: float
    monthly_expenses: float
    monthly_debt_emi: float
    monthly_savings: float
    savings_rate: float
    debt_to_income: float
    emergency_runway_months: float
    net_worth_now: float
    projected_net_worth_1y: float
    projected_net_worth_3y: float
    projected_net_worth_5y: float


class SimulationComparison(BaseModel):
    monthly_savings_diff: float
    debt_to_income_diff: float
    runway_diff_months: float
    net_worth_diff_1y: float
    net_worth_diff_3y: float
    net_worth_diff_5y: float


class SimulationResponse(BaseModel):
    baseline: SituationMetrics
    simulated: SituationMetrics
    comparison: SimulationComparison
    new_loan_emi: float
    feasibility_verdict: str
    verdict_category: str  # 'optimal' | 'caution' | 'high_risk'
    recommendations: List[str]
