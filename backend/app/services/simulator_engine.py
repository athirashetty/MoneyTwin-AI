from typing import List, Tuple
from app.schemas.profile import FinancialProfileBase
from app.schemas.simulator import (
    SimulationScenario,
    SituationMetrics,
    SimulationComparison,
    SimulationResponse,
)
from app.services.financial_engine import (
    calculate_monthly_savings,
    calculate_savings_rate,
    calculate_debt_to_income,
    calculate_emergency_runway,
    calculate_loan_emi,
    calculate_sip_future_value,
    calculate_compound_interest,
)


def _project_net_worth(
    initial_investments: float,
    current_savings: float,
    emergency_fund: float,
    initial_debt: float,
    monthly_wealth_addition: float,
    annual_return_rate: float,
    years: int,
) -> float:
    """
    Project total net worth after N years deterministically.
    Initial investments compound at annual_return_rate.
    Monthly wealth addition compounds via monthly SIP model.
    Debt reduces or stays amortized.
    """
    months = years * 12
    # 1. Existing investments compound
    grown_investments = calculate_compound_interest(
        principal=initial_investments,
        annual_rate=annual_return_rate,
        times_compounded_per_year=12,
        years=years,
    )

    # 2. Accumulated new savings/investments compound
    if monthly_wealth_addition > 0:
        sip_result = calculate_sip_future_value(
            monthly_investment=monthly_wealth_addition,
            annual_return_rate=annual_return_rate,
            tenure_months=months,
        )
        accumulated_wealth = sip_result["future_value"]
    else:
        # Net deficit depletes reserves linearly
        accumulated_wealth = monthly_wealth_addition * months

    # 3. Remaining debt (rough linear reduction over time)
    remaining_debt = max(0.0, initial_debt - (initial_debt / 5.0) * years)

    projected_nw = (
        grown_investments
        + current_savings
        + emergency_fund
        + accumulated_wealth
        - remaining_debt
    )
    return round(projected_nw, 2)


def run_digital_twin_simulation(
    profile: FinancialProfileBase,
    scenario: SimulationScenario,
    annual_market_cagr: float = 12.0,
) -> SimulationResponse:
    """
    Executes a scenario simulation without modifying the original financial profile.
    Compares baseline vs simulated state across 1, 3, and 5-year horizons.
    """
    # 1. BASELINE SITUATION (Unmodified original profile)
    base_income = profile.monthly_salary + profile.additional_income
    base_expenses = profile.essential_expenses + profile.discretionary_expenses
    base_savings = calculate_monthly_savings(
        salary=profile.monthly_salary,
        additional_income=profile.additional_income,
        essential_expenses=profile.essential_expenses,
        discretionary_expenses=profile.discretionary_expenses,
        monthly_emi=profile.monthly_emi,
    )
    base_savings_rate = calculate_savings_rate(base_savings, base_income)
    base_dti = calculate_debt_to_income(profile.monthly_emi, base_income)
    base_runway = calculate_emergency_runway(
        emergency_fund=profile.emergency_fund,
        monthly_burn=profile.essential_expenses + profile.monthly_emi,
    )
    base_net_worth_now = (
        profile.current_savings
        + profile.investments
        + profile.emergency_fund
        - profile.existing_loans
    )

    base_1y = _project_net_worth(
        profile.investments,
        profile.current_savings,
        profile.emergency_fund,
        profile.existing_loans,
        base_savings,
        annual_market_cagr,
        1,
    )
    base_3y = _project_net_worth(
        profile.investments,
        profile.current_savings,
        profile.emergency_fund,
        profile.existing_loans,
        base_savings,
        annual_market_cagr,
        3,
    )
    base_5y = _project_net_worth(
        profile.investments,
        profile.current_savings,
        profile.emergency_fund,
        profile.existing_loans,
        base_savings,
        annual_market_cagr,
        5,
    )

    baseline_metrics = SituationMetrics(
        monthly_income=round(base_income, 2),
        monthly_expenses=round(base_expenses, 2),
        monthly_debt_emi=round(profile.monthly_emi, 2),
        monthly_savings=round(base_savings, 2),
        savings_rate=round(base_savings_rate, 2),
        debt_to_income=round(base_dti, 2),
        emergency_runway_months=round(base_runway, 2),
        net_worth_now=round(base_net_worth_now, 2),
        projected_net_worth_1y=base_1y,
        projected_net_worth_3y=base_3y,
        projected_net_worth_5y=base_5y,
    )

    # 2. SIMULATED SITUATION
    sim_salary = (
        scenario.monthly_salary
        if scenario.monthly_salary is not None
        else profile.monthly_salary
    )
    sim_income = sim_salary + profile.additional_income

    sim_expenses = (
        scenario.monthly_expenses
        if scenario.monthly_expenses is not None
        else base_expenses
    )

    # Calculate new loan EMI
    new_emi_result = calculate_loan_emi(
        principal=scenario.new_loan_amount,
        annual_interest_rate=scenario.new_loan_interest_rate,
        tenure_months=scenario.loan_tenure_months,
    )
    new_loan_monthly_emi = new_emi_result["monthly_emi"]
    sim_total_emi = profile.monthly_emi + new_loan_monthly_emi
    sim_total_debt = profile.existing_loans + scenario.new_loan_amount

    # Cash savings remaining after all expenses, debt, and voluntary SIP step-up
    sim_savings = round(
        sim_income - sim_expenses - sim_total_emi - scenario.monthly_sip_investment,
        2,
    )
    sim_savings_rate = calculate_savings_rate(sim_savings + scenario.monthly_sip_investment, sim_income)
    sim_dti = calculate_debt_to_income(sim_total_emi, sim_income)
    sim_runway = calculate_emergency_runway(
        emergency_fund=profile.emergency_fund,
        monthly_burn=(profile.essential_expenses if scenario.monthly_expenses is None else sim_expenses * 0.6)
        + sim_total_emi,
    )

    # Total wealth added each month (cash savings + invested SIP)
    sim_monthly_wealth_addition = sim_savings + scenario.monthly_sip_investment
    sim_net_worth_now = (
        profile.current_savings
        + profile.investments
        + profile.emergency_fund
        - sim_total_debt
    )

    sim_1y = _project_net_worth(
        profile.investments,
        profile.current_savings,
        profile.emergency_fund,
        sim_total_debt,
        sim_monthly_wealth_addition,
        annual_market_cagr,
        1,
    )
    sim_3y = _project_net_worth(
        profile.investments,
        profile.current_savings,
        profile.emergency_fund,
        sim_total_debt,
        sim_monthly_wealth_addition,
        annual_market_cagr,
        3,
    )
    sim_5y = _project_net_worth(
        profile.investments,
        profile.current_savings,
        profile.emergency_fund,
        sim_total_debt,
        sim_monthly_wealth_addition,
        annual_market_cagr,
        5,
    )

    simulated_metrics = SituationMetrics(
        monthly_income=round(sim_income, 2),
        monthly_expenses=round(sim_expenses, 2),
        monthly_debt_emi=round(sim_total_emi, 2),
        monthly_savings=round(sim_savings, 2),
        savings_rate=round(sim_savings_rate, 2),
        debt_to_income=round(sim_dti, 2),
        emergency_runway_months=round(sim_runway, 2),
        net_worth_now=round(sim_net_worth_now, 2),
        projected_net_worth_1y=sim_1y,
        projected_net_worth_3y=sim_3y,
        projected_net_worth_5y=sim_5y,
    )

    # 3. COMPARISON DELTAS
    comparison = SimulationComparison(
        monthly_savings_diff=round(sim_savings - base_savings, 2),
        debt_to_income_diff=round(sim_dti - base_dti, 2),
        runway_diff_months=round(sim_runway - base_runway, 2),
        net_worth_diff_1y=round(sim_1y - base_1y, 2),
        net_worth_diff_3y=round(sim_3y - base_3y, 2),
        net_worth_diff_5y=round(sim_5y - base_5y, 2),
    )

    # 4. FEASIBILITY EVALUATION & RECOMMENDATIONS
    recommendations: List[str] = []
    if sim_dti > 40.0:
        verdict = "High Debt Burden Risk: Total debt commitments exceed 40% of income."
        verdict_category = "high_risk"
        recommendations.append(
            f"Your new debt commitment increases DTI to {sim_dti}%. Standard banking guidelines recommend capping DTI at 35%."
        )
    elif sim_savings < 15000.0:
        verdict = "Low Cash Cushion Caution: Monthly retained savings drop below safe liquidity margins."
        verdict_category = "caution"
        recommendations.append(
            "Monthly surplus is constrained. Ensure at least ₹20,000/month buffer for unexpected medical or personal expenses."
        )
    elif comparison.net_worth_diff_3y > 0:
        verdict = "Optimal Wealth Accelerating: Scenario elevates net worth while preserving solvency."
        verdict_category = "optimal"
        recommendations.append(
            f"This scenario expands your 3-year net worth by ₹{comparison.net_worth_diff_3y:,.0f} without compromising emergency runway."
        )
    else:
        verdict = "Sustainable Scenario: Preserves baseline financial stability."
        verdict_category = "optimal"
        recommendations.append(
            "The proposed adjustments maintain stable solvency and adequate cash runway."
        )

    if scenario.monthly_sip_investment > 0:
        recommendations.append(
            f"Allocating an additional ₹{scenario.monthly_sip_investment:,.0f}/mo into equity funds compounds significantly over 3-5 years."
        )

    return SimulationResponse(
        baseline=baseline_metrics,
        simulated=simulated_metrics,
        comparison=comparison,
        new_loan_emi=round(new_loan_monthly_emi, 2),
        feasibility_verdict=verdict,
        verdict_category=verdict_category,
        recommendations=recommendations,
    )
