from fastapi import APIRouter
from app.schemas.calculator import (
    EMIRequest,
    EMIResponse,
    SIPRequest,
    SIPResponse,
)
from app.services.financial_engine import (
    calculate_loan_emi,
    calculate_sip_future_value,
)

router = APIRouter()


@router.post("/emi", response_model=EMIResponse, summary="Calculate Loan EMI")
def calculate_emi(request: EMIRequest):
    """
    Calculate exact monthly EMI, total interest, and total repayment amount.
    """
    result = calculate_loan_emi(
        principal=request.principal,
        annual_interest_rate=request.annual_interest_rate,
        tenure_months=request.tenure_months,
    )
    return EMIResponse(**result)


@router.post("/sip", response_model=SIPResponse, summary="Calculate SIP Future Value")
def calculate_sip(request: SIPRequest):
    """
    Calculate future investment value for a Systematic Investment Plan (SIP).
    """
    tenure_months = int(request.tenure_years * 12)
    result = calculate_sip_future_value(
        monthly_investment=request.monthly_investment,
        annual_return_rate=request.annual_return_rate,
        tenure_months=tenure_months,
    )
    return SIPResponse(
        monthly_investment=result["monthly_investment"],
        annual_return_rate=result["annual_return_rate"],
        tenure_years=request.tenure_years,
        total_invested=result["total_invested"],
        estimated_returns=result["estimated_returns"],
        future_value=result["future_value"],
    )
