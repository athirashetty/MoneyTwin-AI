import math
from typing import Dict, Any, Tuple, List


def calculate_monthly_savings(
    salary: float,
    additional_income: float = 0.0,
    essential_expenses: float = 0.0,
    discretionary_expenses: float = 0.0,
    monthly_emi: float = 0.0,
) -> float:
    """
    Calculate net monthly savings (signed float).
    Total Inflow - Total Outflow
    """
    total_income = max(0.0, salary) + max(0.0, additional_income)
    total_outflow = (
        max(0.0, essential_expenses)
        + max(0.0, discretionary_expenses)
        + max(0.0, monthly_emi)
    )
    return round(total_income - total_outflow, 2)


def calculate_savings_rate(monthly_savings: float, total_income: float) -> float:
    """
    Calculate savings rate as a percentage of total income.
    Returns 0.0 if total_income is <= 0.
    """
    if total_income <= 0:
        return 0.0
    rate = (monthly_savings / total_income) * 100.0
    return round(rate, 2)


def calculate_net_worth(
    current_savings: float,
    investments: float,
    emergency_fund: float,
    existing_loans: float,
) -> float:
    """
    Calculate total net worth in INR.
    Total Assets - Total Liabilities
    """
    assets = max(0.0, current_savings) + max(0.0, investments) + max(0.0, emergency_fund)
    liabilities = max(0.0, existing_loans)
    return round(assets - liabilities, 2)


def calculate_debt_to_income(total_emi: float, total_income: float) -> float:
    """
    Calculate Debt-to-Income (DTI) ratio percentage.
    Safe benchmark is <= 30%.
    """
    if total_income <= 0:
        return 100.0 if total_emi > 0 else 0.0
    dti = (max(0.0, total_emi) / total_income) * 100.0
    return round(dti, 2)


def calculate_emergency_runway(
    emergency_fund: float,
    monthly_burn: float,
) -> float:
    """
    Calculate emergency fund runway in months.
    Returns 999.0 if monthly_burn <= 0 and fund > 0.
    Returns 0.0 if fund <= 0.
    """
    fund = max(0.0, emergency_fund)
    burn = max(0.0, monthly_burn)

    if fund <= 0:
        return 0.0
    if burn <= 0:
        return 999.0
    return round(fund / burn, 2)


def calculate_loan_emi(
    principal: float,
    annual_interest_rate: float,
    tenure_months: int,
) -> Dict[str, float]:
    """
    Calculate Equated Monthly Installment (EMI), total interest, and total payment.
    Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    Handles zero interest, invalid tenures, and zero principal safely.
    """
    if principal <= 0 or tenure_months <= 0:
        return {
            "principal": max(0.0, principal),
            "annual_interest_rate": max(0.0, annual_interest_rate),
            "tenure_months": max(0, tenure_months),
            "monthly_emi": 0.0,
            "total_interest": 0.0,
            "total_payment": 0.0,
        }

    p = float(principal)
    n = int(tenure_months)
    annual_rate = max(0.0, float(annual_interest_rate))

    # Zero interest edge case (e.g. 0% EMI promotion)
    if annual_rate == 0.0:
        emi = p / n
        total_payment = p
        total_interest = 0.0
        return {
            "principal": round(p, 2),
            "annual_interest_rate": 0.0,
            "tenure_months": n,
            "monthly_emi": round(emi, 2),
            "total_interest": 0.0,
            "total_payment": round(total_payment, 2),
        }

    # Monthly interest rate
    r = annual_rate / (12.0 * 100.0)

    try:
        factor = math.pow(1.0 + r, n)
        if factor == 1.0:
            emi = p / n
        else:
            emi = (p * r * factor) / (factor - 1.0)
    except OverflowError:
        emi = p * r

    total_payment = emi * n
    total_interest = max(0.0, total_payment - p)

    return {
        "principal": round(p, 2),
        "annual_interest_rate": annual_rate,
        "tenure_months": n,
        "monthly_emi": round(emi, 2),
        "total_interest": round(total_interest, 2),
        "total_payment": round(total_payment, 2),
    }


def calculate_sip_future_value(
    monthly_investment: float,
    annual_return_rate: float,
    tenure_months: int,
) -> Dict[str, float]:
    """
    Calculate Systematic Investment Plan (SIP) future value.
    Formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
    Handles zero return, invalid tenures, and zero investment safely.
    """
    if monthly_investment <= 0 or tenure_months <= 0:
        return {
            "monthly_investment": max(0.0, monthly_investment),
            "annual_return_rate": max(0.0, annual_return_rate),
            "tenure_months": max(0, tenure_months),
            "total_invested": 0.0,
            "estimated_returns": 0.0,
            "future_value": 0.0,
        }

    p = float(monthly_investment)
    n = int(tenure_months)
    annual_rate = max(0.0, float(annual_return_rate))
    total_invested = p * n

    # Zero return edge case
    if annual_rate == 0.0:
        return {
            "monthly_investment": round(p, 2),
            "annual_return_rate": 0.0,
            "tenure_months": n,
            "total_invested": round(total_invested, 2),
            "estimated_returns": 0.0,
            "future_value": round(total_invested, 2),
        }

    r = annual_rate / (12.0 * 100.0)

    try:
        factor = math.pow(1.0 + r, n)
        fv = p * ((factor - 1.0) / r) * (1.0 + r)
    except OverflowError:
        fv = total_invested

    estimated_returns = max(0.0, fv - total_invested)

    return {
        "monthly_investment": round(p, 2),
        "annual_return_rate": annual_rate,
        "tenure_months": n,
        "total_invested": round(total_invested, 2),
        "estimated_returns": round(estimated_returns, 2),
        "future_value": round(fv, 2),
    }


def calculate_compound_interest(
    principal: float,
    annual_rate: float,
    times_compounded_per_year: int = 12,
    years: float = 1.0,
) -> float:
    """
    Calculate compound interest future amount:
    A = P * (1 + r/k)^(k*t)
    """
    if principal <= 0 or years <= 0:
        return max(0.0, principal)

    p = float(principal)
    r = max(0.0, float(annual_rate)) / 100.0
    k = max(1, int(times_compounded_per_year))
    t = max(0.0, float(years))

    if r == 0.0:
        return round(p, 2)

    try:
        amount = p * math.pow(1.0 + (r / k), k * t)
    except OverflowError:
        amount = p * (1.0 + r * t)

    return round(amount, 2)


def calculate_health_score(
    savings_rate: float,
    debt_to_income: float,
    emergency_runway_months: float,
    discretionary_ratio: float = 20.0,
    investments_to_expense_ratio: float = 2.0,
) -> Tuple[int, List[Dict[str, Any]], str]:
    """
    Compute an objective 0-100 Financial Health Score based on 5 pillars:
    1. Savings Rate (25 pts)
    2. Debt-to-Income (25 pts)
    3. Emergency Fund Runway (20 pts)
    4. Discretionary Spending Control (15 pts)
    5. Investment Cushion (15 pts)
    """
    # 1. Savings Rate (Max 25 pts) - Benchmark: >= 20% gives 25
    if savings_rate >= 20.0:
        score_savings = 25.0
    elif savings_rate > 0.0:
        score_savings = (savings_rate / 20.0) * 25.0
    else:
        score_savings = 0.0

    # 2. Debt-to-Income (Max 25 pts) - Benchmark: <= 20% gives 25, 40% gives 10, >50% gives 0
    if debt_to_income <= 20.0:
        score_dti = 25.0
    elif debt_to_income <= 40.0:
        score_dti = 25.0 - ((debt_to_income - 20.0) / 20.0) * 15.0
    elif debt_to_income <= 50.0:
        score_dti = 10.0 - ((debt_to_income - 40.0) / 10.0) * 10.0
    else:
        score_dti = 0.0

    # 3. Emergency Runway (Max 20 pts) - Benchmark: >= 6.0 months gives 20
    if emergency_runway_months >= 6.0:
        score_runway = 20.0
    elif emergency_runway_months > 0.0:
        score_runway = (emergency_runway_months / 6.0) * 20.0
    else:
        score_runway = 0.0

    # 4. Discretionary Ratio (Max 15 pts) - Benchmark: <= 30% gives 15
    if discretionary_ratio <= 30.0:
        score_discretionary = 15.0
    elif discretionary_ratio <= 50.0:
        score_discretionary = 15.0 - ((discretionary_ratio - 30.0) / 20.0) * 10.0
    else:
        score_discretionary = 0.0

    # 5. Investment Cushion (Max 15 pts) - Benchmark: >= 2.0x annual expenses
    if investments_to_expense_ratio >= 2.0:
        score_investments = 15.0
    elif investments_to_expense_ratio > 0.0:
        score_investments = (investments_to_expense_ratio / 2.0) * 15.0
    else:
        score_investments = 0.0

    total_score = int(round(score_savings + score_dti + score_runway + score_discretionary + score_investments))
    total_score = max(0, min(100, total_score))

    breakdown = [
        {
            "factor": "Savings Rate",
            "score": round(score_savings, 1),
            "max_score": 25,
            "benchmark": ">= 20%",
            "value": f"{savings_rate:.1f}%",
            "status": "Optimal" if score_savings >= 20 else "Moderate" if score_savings >= 10 else "Low",
        },
        {
            "factor": "Debt-to-Income",
            "score": round(score_dti, 1),
            "max_score": 25,
            "benchmark": "<= 30%",
            "value": f"{debt_to_income:.1f}%",
            "status": "Healthy" if score_dti >= 18 else "Moderate" if score_dti >= 10 else "Heavy Debt",
        },
        {
            "factor": "Emergency Runway",
            "score": round(score_runway, 1),
            "max_score": 20,
            "benchmark": ">= 6.0 Months",
            "value": f"{emergency_runway_months:.1f} Mo",
            "status": "Optimal" if score_runway >= 18 else "Moderate" if score_runway >= 10 else "Vulnerable",
        },
        {
            "factor": "Discretionary Ratio",
            "score": round(score_discretionary, 1),
            "max_score": 15,
            "benchmark": "<= 30% of Income",
            "value": f"{discretionary_ratio:.1f}%",
            "status": "Disciplined" if score_discretionary >= 12 else "High Spending",
        },
        {
            "factor": "Investment Cushion",
            "score": round(score_investments, 1),
            "max_score": 15,
            "benchmark": ">= 2.0x Annual Expense",
            "value": f"{investments_to_expense_ratio:.1f}x",
            "status": "Strong" if score_investments >= 12 else "Developing",
        },
    ]

    if total_score >= 80:
        verdict = "Optimal Financial Health (A+)"
    elif total_score >= 65:
        verdict = "Good Financial Health (B+)"
    elif total_score >= 50:
        verdict = "Moderate Financial Stability (C)"
    else:
        verdict = "Financial Vulnerability Alert (D)"

    return total_score, breakdown, verdict
