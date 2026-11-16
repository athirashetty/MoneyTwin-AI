from datetime import datetime, timezone
import threading
from app.schemas.profile import (
    FinancialProfileBase,
    FinancialProfileUpdate,
    CalculatedMetrics,
    FinancialProfileResponse,
)
from app.services.financial_engine import (
    calculate_monthly_savings,
    calculate_savings_rate,
    calculate_net_worth,
    calculate_debt_to_income,
    calculate_emergency_runway,
)


class ProfileStore:
    def __init__(self):
        self._lock = threading.Lock()
        # Default Indian Profile (Aarav Sharma)
        self._profile = FinancialProfileBase(
            monthly_salary=185000.0,
            additional_income=25000.0,
            essential_expenses=50500.0,
            discretionary_expenses=37500.0,
            current_savings=200000.0,
            investments=2990000.0,
            existing_loans=780000.0,
            monthly_emi=18500.0,
            emergency_fund=650000.0,
        )
        self._updated_at = datetime.now(timezone.utc).isoformat()

    def get_profile(self) -> FinancialProfileBase:
        with self._lock:
            # Return copy
            return FinancialProfileBase(**self._profile.model_dump())

    def update_profile(self, update: FinancialProfileUpdate) -> FinancialProfileBase:
        with self._lock:
            current_dict = self._profile.model_dump()
            update_dict = update.model_dump(exclude_unset=True)
            for k, v in update_dict.items():
                if v is not None:
                    current_dict[k] = float(v)

            self._profile = FinancialProfileBase(**current_dict)
            self._updated_at = datetime.now(timezone.utc).isoformat()
            return FinancialProfileBase(**self._profile.model_dump())

    def get_calculated_metrics(self, profile: FinancialProfileBase = None) -> CalculatedMetrics:
        target = profile if profile is not None else self.get_profile()
        total_income = target.monthly_salary + target.additional_income
        total_expenses = target.essential_expenses + target.discretionary_expenses
        monthly_savings = calculate_monthly_savings(
            salary=target.monthly_salary,
            additional_income=target.additional_income,
            essential_expenses=target.essential_expenses,
            discretionary_expenses=target.discretionary_expenses,
            monthly_emi=target.monthly_emi,
        )
        savings_rate = calculate_savings_rate(monthly_savings, total_income)
        net_worth = calculate_net_worth(
            current_savings=target.current_savings,
            investments=target.investments,
            emergency_fund=target.emergency_fund,
            existing_loans=target.existing_loans,
        )
        dti = calculate_debt_to_income(target.monthly_emi, total_income)
        runway = calculate_emergency_runway(
            emergency_fund=target.emergency_fund,
            monthly_burn=target.essential_expenses + target.monthly_emi,
        )

        return CalculatedMetrics(
            total_income=round(total_income, 2),
            total_expenses=round(total_expenses, 2),
            monthly_savings=round(monthly_savings, 2),
            savings_rate=round(savings_rate, 2),
            net_worth=round(net_worth, 2),
            debt_to_income=round(dti, 2),
            emergency_runway_months=round(runway, 2),
        )

    def get_response(self) -> FinancialProfileResponse:
        profile = self.get_profile()
        metrics = self.get_calculated_metrics(profile)
        return FinancialProfileResponse(
            profile=profile,
            metrics=metrics,
            updated_at=self._updated_at,
        )


profile_store = ProfileStore()
