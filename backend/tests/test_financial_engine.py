import pytest
from app.services.financial_engine import (
    calculate_monthly_savings,
    calculate_savings_rate,
    calculate_net_worth,
    calculate_debt_to_income,
    calculate_emergency_runway,
    calculate_loan_emi,
    calculate_sip_future_value,
    calculate_compound_interest,
    calculate_health_score,
)


def test_zero_interest_loan():
    """Verify that a 0% interest loan divides principal equally with 0 interest."""
    res = calculate_loan_emi(principal=120000.0, annual_interest_rate=0.0, tenure_months=12)
    assert res["monthly_emi"] == 10000.0
    assert res["total_interest"] == 0.0
    assert res["total_payment"] == 120000.0


def test_different_loan_tenures():
    """Verify EMI decreases and total interest increases as tenure expands."""
    p = 1000000.0  # ₹10 Lakhs
    rate = 9.0  # 9% p.a.
    emi_1y = calculate_loan_emi(p, rate, 12)
    emi_5y = calculate_loan_emi(p, rate, 60)
    emi_20y = calculate_loan_emi(p, rate, 240)

    # Shorter tenure -> higher monthly EMI
    assert emi_1y["monthly_emi"] > emi_5y["monthly_emi"] > emi_20y["monthly_emi"]
    # Longer tenure -> higher total interest
    assert emi_20y["total_interest"] > emi_5y["total_interest"] > emi_1y["total_interest"]
    # Total payment must always exceed principal for positive interest
    assert emi_5y["total_payment"] > p


def test_zero_income():
    """Verify system safely handles 0 income without dividing by zero."""
    savings = calculate_monthly_savings(salary=0.0, additional_income=0.0, essential_expenses=50000.0)
    assert savings == -50000.0

    s_rate = calculate_savings_rate(monthly_savings=-50000.0, total_income=0.0)
    assert s_rate == 0.0

    dti = calculate_debt_to_income(total_emi=15000.0, total_income=0.0)
    assert dti == 100.0

    dti_no_debt = calculate_debt_to_income(total_emi=0.0, total_income=0.0)
    assert dti_no_debt == 0.0


def test_zero_expenses():
    """Verify runway handles zero expense burn safely."""
    runway_with_fund = calculate_emergency_runway(emergency_fund=500000.0, monthly_burn=0.0)
    assert runway_with_fund == 999.0

    runway_without_fund = calculate_emergency_runway(emergency_fund=0.0, monthly_burn=0.0)
    assert runway_without_fund == 0.0


def test_negative_and_invalid_inputs():
    """Verify engine handles negative principal, negative tenures, and negative rates safely."""
    res_neg_p = calculate_loan_emi(principal=-50000.0, annual_interest_rate=8.5, tenure_months=12)
    assert res_neg_p["monthly_emi"] == 0.0

    res_zero_tenure = calculate_loan_emi(principal=50000.0, annual_interest_rate=8.5, tenure_months=0)
    assert res_zero_tenure["monthly_emi"] == 0.0

    res_neg_tenure = calculate_loan_emi(principal=50000.0, annual_interest_rate=8.5, tenure_months=-10)
    assert res_neg_tenure["monthly_emi"] == 0.0

    # Negative expenses clamped
    savings = calculate_monthly_savings(salary=100000.0, essential_expenses=-20000.0)
    assert savings == 100000.0


def test_sip_future_value():
    """Verify SIP calculation with 0% and realistic 12% equity growth."""
    # Zero return -> total invested equals future value
    sip_zero = calculate_sip_future_value(monthly_investment=10000.0, annual_return_rate=0.0, tenure_months=12)
    assert sip_zero["total_invested"] == 120000.0
    assert sip_zero["future_value"] == 120000.0
    assert sip_zero["estimated_returns"] == 0.0

    # 12% annual return for 1 year -> FV must exceed total invested
    sip_12 = calculate_sip_future_value(monthly_investment=10000.0, annual_return_rate=12.0, tenure_months=12)
    assert sip_12["total_invested"] == 120000.0
    assert sip_12["future_value"] > 120000.0
    assert sip_12["estimated_returns"] > 0.0

    # Invalid tenure
    sip_invalid = calculate_sip_future_value(monthly_investment=10000.0, annual_return_rate=12.0, tenure_months=0)
    assert sip_invalid["future_value"] == 0.0


def test_compound_interest():
    """Verify compound interest calculation."""
    # ₹1,00,000 at 10% for 2 years monthly compounding
    amount = calculate_compound_interest(principal=100000.0, annual_rate=10.0, times_compounded_per_year=12, years=2.0)
    assert amount > 120000.0  # More than simple interest (120,000)

    # 0% rate
    amount_zero = calculate_compound_interest(principal=100000.0, annual_rate=0.0, years=5.0)
    assert amount_zero == 100000.0


def test_net_worth_calculation():
    """Verify net worth = Assets - Liabilities."""
    nw = calculate_net_worth(
        current_savings=100000.0,
        investments=500000.0,
        emergency_fund=200000.0,
        existing_loans=300000.0,
    )
    assert nw == 500000.0


def test_health_score_deterministic():
    """Verify health score is bounded between 0 and 100 and deterministic."""
    score, breakdown, verdict = calculate_health_score(
        savings_rate=58.1,
        debt_to_income=8.8,
        emergency_runway_months=7.4,
        discretionary_ratio=18.0,
        investments_to_expense_ratio=2.5,
    )
    assert 0 <= score <= 100
    assert len(breakdown) == 5
    assert "Optimal" in verdict

    # Extreme poor health
    bad_score, _, bad_verdict = calculate_health_score(
        savings_rate=-10.0,
        debt_to_income=75.0,
        emergency_runway_months=0.5,
        discretionary_ratio=65.0,
        investments_to_expense_ratio=0.1,
    )
    assert bad_score < 40
    assert "Alert" in bad_verdict
