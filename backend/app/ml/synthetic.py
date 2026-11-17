"""
Synthetic Financial Data Generation Module for MoneyTwin AI.

Generates realistic Indian urban personal financial records spanning 12-24 months of
transaction history with true-to-life income patterns (salary credits, side income,
festive Diwali bonuses, appraisal hikes), recurring commitments (rent, loan EMI,
SIP investments, utilities), and lifestyle spending (groceries, dining, transport,
entertainment, healthcare).
"""

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
import random
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd
from faker import Faker
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.models.profile import FinancialProfile
from app.models.transaction import Transaction
from app.models.cashflow import MonthlyCashFlow


@dataclass
class UserPersona:
    full_name: str
    email: str
    age: int
    occupation: str
    location: str
    risk_profile: str
    monthly_salary: float
    additional_income: float
    rent: float
    monthly_emi: float
    loan_principal: float
    loan_name: str
    loan_lender: str
    sip_investment: float
    current_savings: float
    investments: float
    emergency_fund: float
    employer: str
    housing_society: str
    appraisal_month: int = 4  # April appraisal
    appraisal_pct: float = 0.10  # 10% raise
    diwali_bonus_pct: float = 0.25  # 25% festive bonus in October


PERSONAS: List[UserPersona] = [
    # Persona 1: Aarav Sharma (Default demo profile matching frontend mockData)
    UserPersona(
        full_name="Aarav Sharma",
        email="aarav.sharma@example.com",
        age=28,
        occupation="Lead Software Engineer",
        location="Bengaluru, India",
        risk_profile="Moderate Aggressive",
        monthly_salary=185000.0,
        additional_income=25000.0,
        rent=32000.0,
        monthly_emi=18500.0,
        loan_principal=780000.0,
        loan_name="HDFC Vehicle Loan (Creta SUV)",
        loan_lender="HDFC Bank",
        sip_investment=50000.0,
        current_savings=200000.0,
        investments=2990000.0,
        emergency_fund=650000.0,
        employer="TechCorp India Pvt Ltd",
        housing_society="Prestige Lakeside Habitat",
        appraisal_pct=0.10,
        diwali_bonus_pct=0.25,
    ),
    # Persona 2: Priya Patel (Mid-career marketer in Mumbai)
    UserPersona(
        full_name="Priya Patel",
        email="priya.patel@example.com",
        age=26,
        occupation="Product Marketing Manager",
        location="Mumbai, India",
        risk_profile="Balanced",
        monthly_salary=120000.0,
        additional_income=15000.0,
        rent=28000.0,
        monthly_emi=12000.0,
        loan_principal=350000.0,
        loan_name="Axis Bank Education Loan",
        loan_lender="Axis Bank",
        sip_investment=25000.0,
        current_savings=150000.0,
        investments=1200000.0,
        emergency_fund=400000.0,
        employer="Omnicom Digital India",
        housing_society="Hiranandani Estate Powai",
        appraisal_pct=0.08,
        diwali_bonus_pct=0.20,
    ),
    # Persona 3: Rohan Verma (Senior Consultant in Delhi NCR with Home Loan)
    UserPersona(
        full_name="Rohan Verma",
        email="rohan.verma@example.com",
        age=34,
        occupation="Senior Strategy Consultant",
        location="Gurgaon, India",
        risk_profile="Aggressive Growth",
        monthly_salary=260000.0,
        additional_income=40000.0,
        rent=0.0,  # Owns apartment with home loan
        monthly_emi=45000.0,
        loan_principal=4200000.0,
        loan_name="SBI Housing Finance Loan",
        loan_lender="State Bank of India",
        sip_investment=80000.0,
        current_savings=400000.0,
        investments=4800000.0,
        emergency_fund=1000000.0,
        employer="McKinsey & Company India",
        housing_society="DLF Phase 5 Residences",
        appraisal_pct=0.12,
        diwali_bonus_pct=0.30,
    ),
    # Persona 4: Ananya Iyer (Independent Consultant in Pune, Debt-Free)
    UserPersona(
        full_name="Ananya Iyer",
        email="ananya.iyer@example.com",
        age=25,
        occupation="UX/UI Design Consultant",
        location="Pune, India",
        risk_profile="Moderate Conservative",
        monthly_salary=95000.0,
        additional_income=20000.0,
        rent=18000.0,
        monthly_emi=0.0,
        loan_principal=0.0,
        loan_name="None",
        loan_lender="None",
        sip_investment=20000.0,
        current_savings=120000.0,
        investments=650000.0,
        emergency_fund=250000.0,
        employer="Independent Retainers & Studio",
        housing_society="Koregaon Park Green View",
        appraisal_pct=0.15,
        diwali_bonus_pct=0.15,
    ),
]


class FinancialDataGenerator:
    """
    Engine to synthesize longitudinal Indian banking and transaction records.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self._rng = np.random.default_rng(seed)
        random.seed(seed)
        self.fake = Faker("en_IN")
        self.fake.seed_instance(seed)
        self._txn_counter = 10000

        # Realistic Indian merchant ecosystem by category
        self.merchants = {
            "Groceries": [
                ("Blinkit Grocery Store", "UPI (GPay)", (1200, 3800)),
                ("Zepto Quick Delivery", "UPI (PhonePe)", (850, 2600)),
                ("Swiggy Instamart", "UPI (Paytm)", (1100, 3400)),
                ("Nature's Basket", "Credit Card", (2200, 5600)),
                ("BigBasket Online Market", "Debit Card", (3000, 6500)),
                ("BB Daily Milk & Essentials", "UPI Auto-Pay", (450, 950)),
            ],
            "Utilities": [
                ("Bescom Electricity Bill", "BBPS", (2100, 3800)),
                ("Tata Power / Adani Energy", "BBPS", (1800, 3500)),
                ("Airtel Xstream Fiber Broadband", "UPI Auto-Pay", (999, 1499)),
                ("JioFiber Ultra HD", "UPI Auto-Pay", (899, 1299)),
                ("Airtel Postpaid Mobile", "UPI (Paytm)", (699, 1199)),
                ("Indane Piped Natural Gas", "BBPS", (750, 1400)),
            ],
            "Transport": [
                ("Uber India Commute", "Credit Card", (280, 850)),
                ("Ola Cabs Corporate", "UPI (GPay)", (250, 780)),
                ("HP Auto Fuel Station", "Credit Card", (2500, 4800)),
                ("Indian Oil Petrol Station", "Debit Card", (2000, 4200)),
                ("Namma Metro Smart Card Recharge", "UPI (PhonePe)", (500, 1000)),
                ("Fastag National Highway Toll", "UPI Auto-Pay", (400, 1200)),
            ],
            "Shopping": [
                ("Amazon India Marketplace", "Credit Card", (1200, 9500)),
                ("Flipkart Internet Pvt Ltd", "Credit Card", (1500, 8000)),
                ("Myntra Fashion App", "Credit Card", (1800, 6200)),
                ("Zara Retail India", "Credit Card", (3500, 12500)),
                ("Uniqlo Lifestyle Clothing", "Credit Card", (2500, 8500)),
                ("Decathlon Sports Store", "Debit Card", (1200, 4800)),
            ],
            "Entertainment": [
                ("Netflix Entertainment India", "Credit Card Auto-Debit", (649, 649)),
                ("Spotify Premium Subscription", "Credit Card Auto-Debit", (179, 179)),
                ("BookMyShow Movie Tickets", "UPI (GPay)", (650, 1600)),
                ("PVR INOX Gold Cinemas", "Credit Card", (1100, 2400)),
                ("YouTube Premium Family", "UPI Auto-Pay", (189, 189)),
                ("Disney+ Hotstar Annual", "Credit Card", (1499, 1499)),
            ],
            "Dining Out": [
                ("Swiggy Gourmet Delivery", "Credit Card", (650, 2100)),
                ("Zomato Dining", "Credit Card", (750, 2600)),
                ("Starbucks Coffee India", "UPI (GPay)", (450, 1200)),
                ("Third Wave Coffee Roasters", "UPI (PhonePe)", (380, 950)),
                ("Toit Brewpub", "Credit Card", (2500, 5500)),
                ("Social Kitchen & Bar", "Credit Card", (1800, 4200)),
            ],
            "Investments": [
                ("Zerodha Broking Ltd (Equity/MF)", "UPI Auto-Pay"),
                ("Groww Invest Tech", "UPI Auto-Pay"),
                ("Parag Parikh Flexi Cap SIP", "NACH Mandate"),
                ("HDFC Index Fund Direct", "NACH Mandate"),
                ("Sovereign Gold Bonds (RBI)", "Net Banking"),
            ],
            "Medical": [
                ("Apollo Pharmacy Store", "UPI (PhonePe)", (450, 2200)),
                ("Practo Consultation Online", "Credit Card", (800, 1800)),
                ("1mg Healthcare Diagnostics", "UPI (GPay)", (1200, 3400)),
                ("Fortis Hospital OPD Clinic", "Debit Card", (1500, 4500)),
            ],
            "Side Income": [
                ("Freelance Tech & Architecture Advisory", "Razorpay Payout"),
                ("Design Consulting Retainer", "Razorpay Payout"),
                ("Substack / Technical Writing Royalty", "Stripe India Direct"),
                ("Upwork Global Escrow Payout", "Wire Transfer"),
            ],
        }

    def _next_txn_ref(self) -> str:
        self._txn_counter += 1
        return f"TXN-{self._txn_counter:06d}"

    def _get_calendar_months(
        self, months_history: int, months_forecast: int, anchor_date: Optional[date] = None
    ) -> Tuple[List[Tuple[int, int]], List[Tuple[int, int]]]:
        """
        Calculates historical and forecast (year, month) tuples ending at anchor_date.
        Default anchor is November 2026.
        """
        if anchor_date is None:
            anchor_date = date(2026, 11, 15)

        current_y = anchor_date.year
        current_m = anchor_date.month

        # Generate historical months ending at anchor month
        history_tuples = []
        for i in range(months_history - 1, -1, -1):
            total_m = current_y * 12 + (current_m - 1) - i
            y = total_m // 12
            m = (total_m % 12) + 1
            history_tuples.append((y, m))

        # Generate future forecast months
        forecast_tuples = []
        for i in range(1, months_forecast + 1):
            total_m = current_y * 12 + (current_m - 1) + i
            y = total_m // 12
            m = (total_m % 12) + 1
            forecast_tuples.append((y, m))

        return history_tuples, forecast_tuples

    def generate_user_data(
        self,
        persona: UserPersona,
        months_history: int = 24,
        months_forecast: int = 4,
        anchor_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Generates full transaction ledger and cash flows for a specific UserPersona.
        """
        if anchor_date is None:
            anchor_date = date(2026, 11, 15)

        history_months, forecast_months = self._get_calendar_months(
            months_history=months_history,
            months_forecast=months_forecast,
            anchor_date=anchor_date,
        )

        all_transactions: List[Dict[str, Any]] = []
        all_cashflows: List[Dict[str, Any]] = []

        # Track evolving salary across years for appraisal increments
        first_year = history_months[0][0]

        for y, m in history_months:
            year_offset = y - first_year
            # Base salary grows with annual appraisal if past appraisal month
            current_salary = persona.monthly_salary * ((1 + persona.appraisal_pct) ** max(0, year_offset))
            current_salary = round(current_salary, 2)

            month_txns: List[Dict[str, Any]] = []

            # -------------------------------------------------------------
            # 1. SALARY CREDIT (Last day of month or 1st)
            # -------------------------------------------------------------
            salary_date = date(y, m, 1)
            month_txns.append({
                "transaction_ref": self._next_txn_ref(),
                "date": salary_date,
                "merchant": persona.employer,
                "category": "Salary",
                "type": "credit",
                "amount": current_salary,
                "payment_method": "NEFT Direct",
                "status": "Completed",
                "description": f"Monthly Take-Home Salary for {salary_date.strftime('%b %Y')}",
                "is_recurring": True,
            })

            # Festive Diwali / Dussehra Bonus in October
            if m == 10 and persona.diwali_bonus_pct > 0:
                bonus_amt = round(current_salary * persona.diwali_bonus_pct, 2)
                bonus_date = date(y, m, 24)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": bonus_date,
                    "merchant": persona.employer,
                    "category": "Salary",
                    "type": "credit",
                    "amount": bonus_amt,
                    "payment_method": "NEFT Direct",
                    "status": "Completed",
                    "description": "Annual Festive Diwali Performance Bonus",
                    "is_recurring": False,
                })

            # -------------------------------------------------------------
            # 2. SIDE INCOME / FREELANCE
            # -------------------------------------------------------------
            if persona.additional_income > 0:
                side_date = date(y, m, int(self._rng.integers(6, 22)))
                side_merchant, side_method = random.choice(self.merchants["Side Income"])
                # Slight variance +/- 15%
                variance = float(self._rng.uniform(0.85, 1.15))
                side_amt = round(persona.additional_income * variance, 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": side_date,
                    "merchant": side_merchant,
                    "category": "Side Income",
                    "type": "credit",
                    "amount": side_amt,
                    "payment_method": side_method,
                    "status": "Completed",
                    "description": "Freelance Client Consultation & Milestone Payout",
                    "is_recurring": False,
                })

            # -------------------------------------------------------------
            # 3. RENT PAYMENT (1st to 4th of month)
            # -------------------------------------------------------------
            if persona.rent > 0:
                rent_date = date(y, m, int(self._rng.integers(1, 5)))
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": rent_date,
                    "merchant": f"{persona.housing_society} (Rent)",
                    "category": "Housing",
                    "type": "debit",
                    "amount": round(persona.rent, 2),
                    "payment_method": "IMPS Transfer",
                    "status": "Completed",
                    "description": f"Apartment Monthly Rent for {rent_date.strftime('%B %Y')}",
                    "is_recurring": True,
                })

            # -------------------------------------------------------------
            # 4. LOAN EMI PAYMENT (5th to 8th of month)
            # -------------------------------------------------------------
            if persona.monthly_emi > 0:
                emi_date = date(y, m, int(self._rng.integers(5, 9)))
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": emi_date,
                    "merchant": f"{persona.loan_lender} EMI Mandate",
                    "category": "Debt / Loan",
                    "type": "debit",
                    "amount": round(persona.monthly_emi, 2),
                    "payment_method": "NACH Mandate",
                    "status": "Completed",
                    "description": f"Monthly installment for {persona.loan_name}",
                    "is_recurring": True,
                })

            # -------------------------------------------------------------
            # 5. SIP INVESTMENTS (10th to 14th of month)
            # -------------------------------------------------------------
            if persona.sip_investment > 0:
                sip_date = date(y, m, int(self._rng.integers(10, 15)))
                inv_merchant, inv_method = random.choice(self.merchants["Investments"])
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": sip_date,
                    "merchant": inv_merchant,
                    "category": "Investments",
                    "type": "debit",
                    "amount": round(persona.sip_investment, 2),
                    "payment_method": inv_method,
                    "status": "Completed",
                    "description": "Systematic Investment Plan (SIP) Portfolio Allocation",
                    "is_recurring": True,
                })

            # -------------------------------------------------------------
            # 6. UTILITIES (Electricity, Broadband, Mobile, Gas)
            # -------------------------------------------------------------
            num_utilities = int(self._rng.integers(2, 4))
            chosen_utilities = random.sample(self.merchants["Utilities"], num_utilities)
            for util_name, util_method, (low_u, high_u) in chosen_utilities:
                util_date = date(y, m, int(self._rng.integers(10, 22)))
                util_amt = round(float(self._rng.uniform(low_u, high_u)), 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": util_date,
                    "merchant": util_name,
                    "category": "Utilities",
                    "type": "debit",
                    "amount": util_amt,
                    "payment_method": util_method,
                    "status": "Completed",
                    "description": f"Monthly Utility Bill: {util_name}",
                    "is_recurring": True,
                })

            # -------------------------------------------------------------
            # 7. GROCERIES & ESSENTIALS (4 to 6 transactions)
            # -------------------------------------------------------------
            num_groceries = int(self._rng.integers(4, 7))
            for _ in range(num_groceries):
                g_day = int(self._rng.integers(1, 28))
                g_date = date(y, m, g_day)
                g_merchant, g_method, (low_g, high_g) = random.choice(self.merchants["Groceries"])
                g_amt = round(float(self._rng.uniform(low_g, high_g)), 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": g_date,
                    "merchant": g_merchant,
                    "category": "Groceries",
                    "type": "debit",
                    "amount": g_amt,
                    "payment_method": g_method,
                    "status": "Completed",
                    "description": "Household Grocery Supplies & Produce",
                    "is_recurring": False,
                })

            # -------------------------------------------------------------
            # 8. DINING OUT & FOOD DELIVERY (5 to 9 transactions, weekend bias)
            # -------------------------------------------------------------
            num_dining = int(self._rng.integers(5, 10))
            for _ in range(num_dining):
                d_day = int(self._rng.integers(1, 28))
                d_date = date(y, m, d_day)
                # Weekend multiplier (Fri/Sat/Sun spend slightly higher)
                weekend_boost = 1.35 if d_date.weekday() in (4, 5, 6) else 1.0
                d_merchant, d_method, (low_d, high_d) = random.choice(self.merchants["Dining Out"])
                d_amt = round(float(self._rng.uniform(low_d, high_d)) * weekend_boost, 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": d_date,
                    "merchant": d_merchant,
                    "category": "Dining Out",
                    "type": "debit",
                    "amount": d_amt,
                    "payment_method": d_method,
                    "status": "Completed",
                    "description": f"Restaurant / Online Food Delivery from {d_merchant}",
                    "is_recurring": False,
                })

            # -------------------------------------------------------------
            # 9. TRANSPORT & COMMUTE (6 to 12 transactions)
            # -------------------------------------------------------------
            num_transport = int(self._rng.integers(6, 13))
            for _ in range(num_transport):
                t_day = int(self._rng.integers(1, 28))
                t_date = date(y, m, t_day)
                t_merchant, t_method, (low_t, high_t) = random.choice(self.merchants["Transport"])
                t_amt = round(float(self._rng.uniform(low_t, high_t)), 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": t_date,
                    "merchant": t_merchant,
                    "category": "Transport",
                    "type": "debit",
                    "amount": t_amt,
                    "payment_method": t_method,
                    "status": "Completed",
                    "description": f"Local Travel & Commute: {t_merchant}",
                    "is_recurring": False,
                })

            # -------------------------------------------------------------
            # 10. SHOPPING (2 to 4 transactions, boosted in Oct/Nov)
            # -------------------------------------------------------------
            num_shopping = int(self._rng.integers(2, 5))
            if m in (10, 11):  # Festive shopping season
                num_shopping += 2
            for _ in range(num_shopping):
                s_day = int(self._rng.integers(1, 28))
                s_date = date(y, m, s_day)
                s_merchant, s_method, (low_s, high_s) = random.choice(self.merchants["Shopping"])
                s_amt = round(float(self._rng.uniform(low_s, high_s)), 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": s_date,
                    "merchant": s_merchant,
                    "category": "Shopping",
                    "type": "debit",
                    "amount": s_amt,
                    "payment_method": s_method,
                    "status": "Completed",
                    "description": f"Lifestyle & Electronics Shopping at {s_merchant}",
                    "is_recurring": False,
                })

            # -------------------------------------------------------------
            # 11. ENTERTAINMENT & SUBSCRIPTIONS (2 to 4 transactions)
            # -------------------------------------------------------------
            num_ent = int(self._rng.integers(2, 5))
            chosen_ent = random.sample(self.merchants["Entertainment"], num_ent)
            for e_merchant, e_method, (low_e, high_e) in chosen_ent:
                e_day = int(self._rng.integers(1, 28))
                e_date = date(y, m, e_day)
                e_amt = round(float(self._rng.uniform(low_e, high_e)), 2)
                month_txns.append({
                    "transaction_ref": self._next_txn_ref(),
                    "date": e_date,
                    "merchant": e_merchant,
                    "category": "Entertainment",
                    "type": "debit",
                    "amount": e_amt,
                    "payment_method": e_method,
                    "status": "Completed",
                    "description": f"Entertainment / Stream: {e_merchant}",
                    "is_recurring": "Subscription" in e_merchant or "Netflix" in e_merchant,
                })

            # -------------------------------------------------------------
            # 12. MEDICAL & HEALTHCARE (occasional 0 to 2 transactions)
            # -------------------------------------------------------------
            if self._rng.random() > 0.35:
                num_med = int(self._rng.integers(1, 3))
                for _ in range(num_med):
                    med_day = int(self._rng.integers(1, 28))
                    med_date = date(y, m, med_day)
                    m_merchant, m_method, (low_m, high_m) = random.choice(self.merchants["Medical"])
                    m_amt = round(float(self._rng.uniform(low_m, high_m)), 2)
                    month_txns.append({
                        "transaction_ref": self._next_txn_ref(),
                        "date": med_date,
                        "merchant": m_merchant,
                        "category": "Medical",
                        "type": "debit",
                        "amount": m_amt,
                        "payment_method": m_method,
                        "status": "Completed",
                        "description": f"Medical Care / Pharmacy: {m_merchant}",
                        "is_recurring": False,
                    })

            # Sort month transactions chronologically
            month_txns.sort(key=lambda t: t["date"])
            all_transactions.extend(month_txns)

            # Calculate monthly totals for MonthlyCashFlow
            m_income = sum(t["amount"] for t in month_txns if t["type"] == "credit")
            m_expenses = sum(t["amount"] for t in month_txns if t["type"] == "debit")
            m_savings = max(0.0, m_income - m_expenses)

            month_str = f"{y:04d}-{m:02d}"
            month_date_obj = date(y, m, 1)
            is_anchor = (y == anchor_date.year and m == anchor_date.month)
            month_label = f"{month_date_obj.strftime('%b')} (Now)" if is_anchor else month_date_obj.strftime("%b %Y")

            notes = None
            if m == 10:
                notes = "Diwali festive bonus & high seasonal spend"
            elif m == persona.appraisal_month and y > first_year:
                notes = "Annual appraisal salary hike"

            all_cashflows.append({
                "month_year": month_str,
                "month_label": month_label,
                "income": round(m_income, 2),
                "expenses": round(m_expenses, 2),
                "savings": round(m_savings, 2),
                "flow_type": "actual",
                "notes": notes,
            })

        # -------------------------------------------------------------
        # 13. GENERATE DIGITAL TWIN FORECASTS FOR FUTURE MONTHS
        # -------------------------------------------------------------
        recent_actuals = all_cashflows[-6:]
        avg_income = float(np.mean([cf["income"] for cf in recent_actuals]))
        avg_expenses = float(np.mean([cf["expenses"] for cf in recent_actuals]))

        for i, (fy, fm) in enumerate(forecast_months):
            f_date_obj = date(fy, fm, 1)
            f_month_str = f"{fy:04d}-{fm:02d}"
            f_label = f"{f_date_obj.strftime('%b')} (Twin)"

            # Forecast trend modeling
            projected_income = avg_income
            if fm == persona.appraisal_month:
                projected_income *= (1 + persona.appraisal_pct)

            # Slight expense stabilization
            projected_expenses = avg_expenses * float(self._rng.uniform(0.97, 1.02))
            projected_savings = max(0.0, projected_income - projected_expenses)

            f_notes = "Projected Digital Twin simulation"
            if fm == persona.appraisal_month:
                f_notes = "Expected annual compensation review"

            all_cashflows.append({
                "month_year": f_month_str,
                "month_label": f_label,
                "income": round(projected_income, 2),
                "expenses": round(projected_expenses, 2),
                "savings": round(projected_savings, 2),
                "flow_type": "forecast",
                "notes": f_notes,
            })

        # Calculate latest profile snapshot
        latest_actual_cf = all_cashflows[-len(forecast_months) - 1]
        essential_expenses = (
            persona.rent
            + persona.monthly_emi
            + 18000.0  # Groceries & Utilities average
        )
        discretionary_expenses = max(
            0.0, latest_actual_cf["expenses"] - essential_expenses - persona.sip_investment
        )

        return {
            "persona": persona,
            "profile_data": {
                "monthly_salary": persona.monthly_salary,
                "additional_income": persona.additional_income,
                "essential_expenses": round(essential_expenses, 2),
                "discretionary_expenses": round(discretionary_expenses, 2),
                "current_savings": persona.current_savings,
                "investments": persona.investments,
                "existing_loans": persona.loan_principal,
                "monthly_emi": persona.monthly_emi,
                "emergency_fund": persona.emergency_fund,
                "currency": "INR",
                "twin_status": "Synchronized (Active Mirror)",
            },
            "transactions": all_transactions,
            "cashflows": all_cashflows,
        }

    def generate_all(
        self,
        months_history: int = 24,
        months_forecast: int = 4,
        anchor_date: Optional[date] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generates data for all configured personas.
        """
        results = []
        for persona in PERSONAS:
            data = self.generate_user_data(
                persona=persona,
                months_history=months_history,
                months_forecast=months_forecast,
                anchor_date=anchor_date,
            )
            results.append(data)
        return results

    def populate_database(
        self,
        db: Session,
        clear_existing: bool = True,
        months_history: int = 24,
        months_forecast: int = 4,
    ) -> Dict[str, int]:
        """
        Synthesizes realistic data and writes User, FinancialProfile, Transaction,
        and MonthlyCashFlow entities into the SQLAlchemy database.
        """
        # Ensure schema tables exist
        Base.metadata.create_all(bind=engine)

        if clear_existing:
            # Cascading deletion from User clears profiles, transactions, and cashflows
            db.query(MonthlyCashFlow).delete()
            db.query(Transaction).delete()
            db.query(FinancialProfile).delete()
            db.query(User).delete()
            db.commit()

        generated_data = self.generate_all(
            months_history=months_history,
            months_forecast=months_forecast,
        )

        total_users = 0
        total_profiles = 0
        total_transactions = 0
        total_cashflows = 0

        for item in generated_data:
            p = item["persona"]
            # 1. Create User
            user = User(
                email=p.email,
                full_name=p.full_name,
                age=p.age,
                occupation=p.occupation,
                location=p.location,
                risk_profile=p.risk_profile,
                is_active=True,
            )
            db.add(user)
            db.flush()  # Populates user.id
            total_users += 1

            # 2. Create FinancialProfile
            prof_data = item["profile_data"]
            profile = FinancialProfile(
                user_id=user.id,
                monthly_salary=prof_data["monthly_salary"],
                additional_income=prof_data["additional_income"],
                essential_expenses=prof_data["essential_expenses"],
                discretionary_expenses=prof_data["discretionary_expenses"],
                current_savings=prof_data["current_savings"],
                investments=prof_data["investments"],
                existing_loans=prof_data["existing_loans"],
                monthly_emi=prof_data["monthly_emi"],
                emergency_fund=prof_data["emergency_fund"],
                currency=prof_data["currency"],
                twin_status=prof_data["twin_status"],
            )
            db.add(profile)
            total_profiles += 1

            # 3. Create Transactions in batches
            txn_objects = [
                Transaction(
                    transaction_ref=t["transaction_ref"],
                    user_id=user.id,
                    date=t["date"],
                    merchant=t["merchant"],
                    category=t["category"],
                    type=t["type"],
                    amount=t["amount"],
                    payment_method=t["payment_method"],
                    status=t["status"],
                    description=t.get("description"),
                    is_recurring=t.get("is_recurring", False),
                )
                for t in item["transactions"]
            ]
            db.add_all(txn_objects)
            total_transactions += len(txn_objects)

            # 4. Create MonthlyCashFlow records
            cf_objects = [
                MonthlyCashFlow(
                    user_id=user.id,
                    month_year=cf["month_year"],
                    month_label=cf["month_label"],
                    income=cf["income"],
                    expenses=cf["expenses"],
                    savings=cf["savings"],
                    flow_type=cf["flow_type"],
                    notes=cf.get("notes"),
                )
                for cf in item["cashflows"]
            ]
            db.add_all(cf_objects)
            total_cashflows += len(cf_objects)

        db.commit()

        return {
            "users": total_users,
            "profiles": total_profiles,
            "transactions": total_transactions,
            "cashflows": total_cashflows,
        }
