import pytest
from app.schemas.profile import FinancialProfileBase
from app.schemas.simulator import SimulationScenario
from app.services.simulator_engine import run_digital_twin_simulation


@pytest.fixture
def baseline_profile():
    return FinancialProfileBase(
        monthly_salary=150000.0,
        additional_income=10000.0,
        essential_expenses=45000.0,
        discretionary_expenses=25000.0,
        current_savings=150000.0,
        investments=1000000.0,
        existing_loans=500000.0,
        monthly_emi=15000.0,
        emergency_fund=400000.0,
    )


def test_simulation_does_not_modify_original_data(baseline_profile):
    """Verify that running a simulation leaves the original profile bit-for-bit identical."""
    original_dict = baseline_profile.model_dump()

    scenario = SimulationScenario(
        monthly_salary=250000.0,
        new_loan_amount=2000000.0,
        new_loan_interest_rate=9.0,
        loan_tenure_months=60,
        monthly_sip_investment=50000.0,
    )

    res = run_digital_twin_simulation(baseline_profile, scenario)

    # Verify original profile remains unmodified
    assert baseline_profile.model_dump() == original_dict
    assert baseline_profile.monthly_salary == 150000.0
    assert baseline_profile.existing_loans == 500000.0

    # Verify simulation captured the new numbers
    assert res.simulated.monthly_income == 260000.0  # 250k + 10k
    assert res.new_loan_emi > 0.0
    assert res.simulated.monthly_debt_emi == baseline_profile.monthly_emi + res.new_loan_emi


def test_simulation_salary_hike_increases_projections(baseline_profile):
    """Verify that increasing salary increases monthly savings and 1, 3, 5-year net worth."""
    scenario = SimulationScenario(
        monthly_salary=200000.0,  # +50k
    )

    res = run_digital_twin_simulation(baseline_profile, scenario)

    assert res.comparison.monthly_savings_diff == 50000.0
    assert res.comparison.net_worth_diff_1y > 0
    assert res.comparison.net_worth_diff_3y > res.comparison.net_worth_diff_1y
    assert res.comparison.net_worth_diff_5y > res.comparison.net_worth_diff_3y


def test_simulation_heavy_loan_triggers_risk_verdict(baseline_profile):
    """Verify that taking an oversized loan triggers a high risk verdict."""
    scenario = SimulationScenario(
        new_loan_amount=5000000.0,  # ₹50 Lakhs loan
        new_loan_interest_rate=12.0,
        loan_tenure_months=36,
    )

    res = run_digital_twin_simulation(baseline_profile, scenario)
    assert res.simulated.debt_to_income > 40.0
    assert res.verdict_category == "high_risk"
