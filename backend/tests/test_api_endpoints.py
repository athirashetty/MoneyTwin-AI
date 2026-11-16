import pytest
from app.schemas.profile import FinancialProfileUpdate
from app.schemas.simulator import SimulationScenario
from app.schemas.calculator import EMIRequest, SIPRequest
from app.api.v1.endpoints.profile import get_financial_profile, update_financial_profile
from app.api.v1.endpoints.health_score import get_financial_health_score
from app.api.v1.endpoints.simulator import run_simulation
from app.api.v1.endpoints.calculators import calculate_emi, calculate_sip


def test_get_profile_endpoint():
    res = get_financial_profile()
    assert res.profile.monthly_salary > 0
    assert res.metrics.total_income > 0
    assert res.metrics.savings_rate >= 0
    assert res.metrics.debt_to_income >= 0


def test_update_profile_endpoint():
    # Update salary
    update = FinancialProfileUpdate(monthly_salary=220000.0)
    res = update_financial_profile(update)
    assert res.profile.monthly_salary == 220000.0
    assert res.metrics.total_income >= 220000.0


def test_health_score_endpoint():
    res = get_financial_health_score()
    assert 0 <= res["overall_score"] <= 100
    assert res["max_score"] == 100
    assert len(res["breakdown"]) == 5
    assert "metrics_summary" in res


def test_simulator_run_endpoint():
    scenario = SimulationScenario(
        monthly_salary=250000.0,
        new_loan_amount=500000.0,
        new_loan_interest_rate=8.5,
        loan_tenure_months=36,
        monthly_sip_investment=20000.0,
    )
    res = run_simulation(scenario)
    assert res.baseline.monthly_income > 0
    assert res.simulated.monthly_income == 275000.0  # 250k + 25k additional income
    assert res.new_loan_emi > 0
    assert res.simulated.projected_net_worth_5y > 0
    assert len(res.recommendations) > 0


def test_calculator_emi_endpoint():
    req = EMIRequest(principal=1000000.0, annual_interest_rate=8.5, tenure_months=60)
    res = calculate_emi(req)
    assert res.monthly_emi > 0
    assert res.total_payment > res.principal
    assert res.total_interest == round(res.total_payment - res.principal, 2)


def test_calculator_sip_endpoint():
    req = SIPRequest(monthly_investment=25000.0, annual_return_rate=12.0, tenure_years=3.0)
    res = calculate_sip(req)
    assert res.total_invested == 25000.0 * 36
    assert res.future_value > res.total_invested
    assert res.estimated_returns == round(res.future_value - res.total_invested, 2)
