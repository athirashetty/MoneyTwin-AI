from fastapi import APIRouter
from app.services.profile_store import profile_store
from app.services.financial_engine import calculate_health_score

router = APIRouter()


@router.get("", summary="Get Financial Health Score")
def get_financial_health_score():
    """
    Evaluates the user's financial health score (0 - 100) across 5 core financial pillars.
    """
    profile = profile_store.get_profile()
    metrics = profile_store.get_calculated_metrics(profile)

    # Discretionary ratio
    total_income = metrics.total_income
    discretionary_ratio = (
        (profile.discretionary_expenses / total_income * 100.0)
        if total_income > 0
        else 0.0
    )

    # Investment cushion vs annual expenses
    annual_expenses = metrics.total_expenses * 12.0
    inv_cushion = (
        (profile.investments / annual_expenses)
        if annual_expenses > 0
        else 2.0
    )

    total_score, breakdown, verdict = calculate_health_score(
        savings_rate=metrics.savings_rate,
        debt_to_income=metrics.debt_to_income,
        emergency_runway_months=metrics.emergency_runway_months,
        discretionary_ratio=discretionary_ratio,
        investments_to_expense_ratio=inv_cushion,
    )

    return {
        "overall_score": total_score,
        "max_score": 100,
        "verdict": verdict,
        "metrics_summary": metrics.model_dump(),
        "breakdown": breakdown,
    }
