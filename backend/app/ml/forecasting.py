"""
Machine Learning Cash Flow Forecasting Module for MoneyTwin AI.

Uses Scikit-Learn RandomForestRegressor to predict future income, expenses,
and net savings trajectories based on historical transaction records and
monthly cash flow statements.

Features Engineered:
- previous month income (lag_1)
- previous month expenses (lag_1)
- previous month savings (lag_1)
- 3-month rolling average income
- 3-month rolling average expenses
- savings trend (momentum / difference)
- calendar seasonality (month number, Indian festive season, appraisal season)
- time trend step
"""

from contextlib import contextmanager
from datetime import date, datetime
from typing import Any, Dict, Generator, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.cashflow import MonthlyCashFlow
from app.models.profile import FinancialProfile
from app.models.transaction import Transaction
from app.models.user import User


FEATURE_COLUMNS = [
    "prev_income",
    "prev_expenses",
    "prev_savings",
    "income_rolling_3m",
    "expenses_rolling_3m",
    "savings_trend",
    "month_num",
    "is_festive_season",
    "is_appraisal_season",
    "time_step",
]


class CashFlowForecaster:
    """
    ML-driven cash flow forecasting engine for MoneyTwin AI.
    Trains twin RandomForestRegressors on a user's historical inflows and outflows
    to project forward-looking income, expenses, and wealth accretion.
    """

    def __init__(self, db: Optional[Session] = None, random_state: int = 42):
        self.db = db
        self.random_state = random_state
        self.income_model: Optional[RandomForestRegressor] = None
        self.expense_model: Optional[RandomForestRegressor] = None
        self.feature_names: List[str] = FEATURE_COLUMNS
        self.historical_df: Optional[pd.DataFrame] = None
        self.last_known_date: Optional[date] = None

    @contextmanager
    def _get_session(self) -> Generator[Session, None, None]:
        """Provides an active database session, yielding injected session or new SessionLocal."""
        if self.db is not None:
            yield self.db
        else:
            session = SessionLocal()
            try:
                yield session
            finally:
                session.close()

    def load_historical_data(self, user_id: int) -> pd.DataFrame:
        """
        Loads and prepares historical monthly financial data for the given user.
        Prioritizes actual MonthlyCashFlow records, falls back to Transaction aggregations,
        and uses FinancialProfile as a baseline anchor if history is nascent.
        """
        with self._get_session() as session:
            # 1. Fetch actual MonthlyCashFlow records
            cfs = (
                session.query(MonthlyCashFlow)
                .filter(
                    MonthlyCashFlow.user_id == user_id,
                    MonthlyCashFlow.flow_type == "actual",
                )
                .order_by(MonthlyCashFlow.month_year.asc())
                .all()
            )

            records = []
            if cfs:
                for cf in cfs:
                    parts = cf.month_year.split("-")
                    y, m = int(parts[0]), int(parts[1])
                    records.append({
                        "month_year": cf.month_year,
                        "year": y,
                        "month": m,
                        "income": float(cf.income),
                        "expenses": float(cf.expenses),
                        "savings": float(cf.savings),
                    })
            else:
                # 2. Fallback: Aggregate directly from the Transaction ledger
                txns = (
                    session.query(Transaction)
                    .filter(Transaction.user_id == user_id)
                    .order_by(Transaction.date.asc())
                    .all()
                )
                if txns:
                    monthly_map: Dict[str, Dict[str, float]] = {}
                    for t in txns:
                        my = t.date.strftime("%Y-%m")
                        if my not in monthly_map:
                            monthly_map[my] = {"year": t.date.year, "month": t.date.month, "income": 0.0, "expenses": 0.0}
                        if t.type == "credit":
                            monthly_map[my]["income"] += float(t.amount)
                        else:
                            monthly_map[my]["expenses"] += float(t.amount)

                    for my, d in sorted(monthly_map.items()):
                        inc = round(d["income"], 2)
                        exp = round(d["expenses"], 2)
                        records.append({
                            "month_year": my,
                            "year": d["year"],
                            "month": d["month"],
                            "income": inc,
                            "expenses": exp,
                            "savings": max(0.0, round(inc - exp, 2)),
                        })

            # 3. If still empty, synthesize an initial 6-month baseline from FinancialProfile
            if not records:
                profile = (
                    session.query(FinancialProfile)
                    .filter(FinancialProfile.user_id == user_id)
                    .first()
                )
                base_income = (profile.monthly_salary + profile.additional_income) if profile else 185000.0
                base_expenses = (profile.essential_expenses + profile.discretionary_expenses + profile.monthly_emi) if profile else 88000.0
                base_savings = max(0.0, base_income - base_expenses)

                now = datetime.utcnow()
                for i in range(6, 0, -1):
                    # Step backwards
                    m_idx = (now.month - i) % 12 or 12
                    y_idx = now.year if (now.month - i) > 0 else (now.year - 1)
                    my_str = f"{y_idx:04d}-{m_idx:02d}"
                    records.append({
                        "month_year": my_str,
                        "year": y_idx,
                        "month": m_idx,
                        "income": base_income,
                        "expenses": base_expenses,
                        "savings": base_savings,
                    })

        df = pd.DataFrame(records).sort_values("month_year").reset_index(drop=True)
        self.historical_df = df

        # Track last known historical month
        last_row = df.iloc[-1]
        self.last_known_date = date(int(last_row["year"]), int(last_row["month"]), 1)
        return df

    def create_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
        """
        Engineers temporal, lag, rolling average, and trend features for ML training.

        Returns:
            X: Feature matrix
            y_income: Target vector for monthly income
            y_expenses: Target vector for monthly expenses
        """
        data = df.copy()

        # 1. Autoregressive Lag Features
        data["prev_income"] = data["income"].shift(1)
        data["prev_expenses"] = data["expenses"].shift(1)
        data["prev_savings"] = data["savings"].shift(1)

        # 2. Rolling Window Averages (smoothed baseline)
        data["income_rolling_3m"] = (
            data["income"].shift(1).rolling(window=3, min_periods=1).mean()
        )
        data["expenses_rolling_3m"] = (
            data["expenses"].shift(1).rolling(window=3, min_periods=1).mean()
        )

        # 3. Savings Momentum / Trend (velocity of savings)
        data["savings_trend"] = data["prev_savings"] - data["savings"].shift(2).fillna(
            data["prev_savings"]
        )

        # 4. Calendar & Seasonality Indicators
        data["month_num"] = data["month"]
        data["is_festive_season"] = data["month"].isin([10, 11]).astype(int)  # Diwali bonus & spending
        data["is_appraisal_season"] = (data["month"] == 4).astype(int)        # April appraisal hikes

        # 5. Monotonic Time Trend
        data["time_step"] = np.arange(len(data))

        # Drop rows where lag values are NaN (the first observation)
        clean_data = data.dropna(subset=["prev_income", "prev_expenses"]).copy()

        X = clean_data[FEATURE_COLUMNS]
        y_income = clean_data["income"]
        y_expenses = clean_data["expenses"]

        return X, y_income, y_expenses

    def fit(self, user_id: int) -> "CashFlowForecaster":
        """
        Fits twin Random Forest models on the user's historical data:
        one specialized for income dynamics, and one for expense patterns.
        """
        df = self.load_historical_data(user_id)
        X, y_income, y_expenses = self.create_features(df)

        # If data is sparse (<4 rows), duplicate with slight variance to allow robust tree splitting
        if len(X) < 4:
            X = pd.concat([X, X], ignore_index=True)
            y_income = pd.concat([y_income, y_income], ignore_index=True)
            y_expenses = pd.concat([y_expenses, y_expenses], ignore_index=True)

        self.income_model = RandomForestRegressor(
            n_estimators=50,
            max_depth=4,
            min_samples_split=2,
            random_state=self.random_state,
        )
        self.income_model.fit(X, y_income)

        self.expense_model = RandomForestRegressor(
            n_estimators=50,
            max_depth=4,
            min_samples_split=2,
            random_state=self.random_state + 1,
        )
        self.expense_model.fit(X, y_expenses)

        return self

    def predict(self, horizon_months: int = 6) -> List[Dict[str, Any]]:
        """
        Executes multi-step iterative forecasting for N months into the future.
        Each forecasted step feeds its predicted lag values into the subsequent step.
        """
        if self.income_model is None or self.expense_model is None or self.historical_df is None:
            raise ValueError("CashFlowForecaster must be fitted before predict() is called.")

        recent_df = self.historical_df.copy()
        forecasts: List[Dict[str, Any]] = []

        curr_year = self.last_known_date.year
        curr_month = self.last_known_date.month
        current_step = len(recent_df)

        for step in range(1, horizon_months + 1):
            # Calculate next calendar month
            total_m = curr_year * 12 + (curr_month - 1) + step
            pred_y = total_m // 12
            pred_m = (total_m % 12) + 1
            month_str = f"{pred_y:04d}-{pred_m:02d}"
            date_obj = date(pred_y, pred_m, 1)
            month_label = f"{date_obj.strftime('%b')} (Twin)"

            # Extract latest lags and rolling stats from running DataFrame
            last_record = recent_df.iloc[-1]
            prev_income = float(last_record["income"])
            prev_expenses = float(last_record["expenses"])
            prev_savings = float(last_record["savings"])

            # 3-month rolling statistics
            tail_3 = recent_df.tail(3)
            rolling_income = float(tail_3["income"].mean())
            rolling_expenses = float(tail_3["expenses"].mean())

            # Savings trend (momentum)
            prev2_savings = float(recent_df.iloc[-2]["savings"]) if len(recent_df) >= 2 else prev_savings
            savings_trend = prev_savings - prev2_savings

            # Feature dictionary
            feat_dict = {
                "prev_income": prev_income,
                "prev_expenses": prev_expenses,
                "prev_savings": prev_savings,
                "income_rolling_3m": rolling_income,
                "expenses_rolling_3m": rolling_expenses,
                "savings_trend": savings_trend,
                "month_num": pred_m,
                "is_festive_season": 1 if pred_m in [10, 11] else 0,
                "is_appraisal_season": 1 if pred_m == 4 else 0,
                "time_step": current_step + step,
            }

            X_step = pd.DataFrame([feat_dict])[FEATURE_COLUMNS]

            # Model Predictions
            pred_income = float(self.income_model.predict(X_step)[0])
            pred_expenses = float(self.expense_model.predict(X_step)[0])

            # Apply domain constraints (positive bounds)
            pred_income = max(1000.0, round(pred_income, 2))
            pred_expenses = max(1000.0, round(pred_expenses, 2))
            pred_savings = max(0.0, round(pred_income - pred_expenses, 2))
            savings_rate = round((pred_savings / pred_income) * 100.0, 1) if pred_income > 0 else 0.0

            # Qualitative Insights
            insights = []
            if pred_m == 4:
                insights.append("Expected annual appraisal compensation review")
            if pred_m in [10, 11]:
                insights.append("Festive season bonus & increased discretionary spending")
            if savings_rate >= 50.0:
                insights.append("High wealth accumulation velocity (> 50% savings rate)")
            elif savings_rate < 20.0:
                insights.append("Caution: Savings rate below recommended 20% benchmark")

            forecasts.append({
                "month_year": month_str,
                "month_label": month_label,
                "predicted_income": pred_income,
                "predicted_expenses": pred_expenses,
                "predicted_savings": pred_savings,
                "savings_rate": savings_rate,
                "insights": insights,
            })

            # Append prediction to running DataFrame to feed into next autoregressive lag
            new_row = pd.DataFrame([{
                "month_year": month_str,
                "year": pred_y,
                "month": pred_m,
                "income": pred_income,
                "expenses": pred_expenses,
                "savings": pred_savings,
            }])
            recent_df = pd.concat([recent_df, new_row], ignore_index=True)

        return forecasts

    def get_feature_importances(self) -> Dict[str, Dict[str, float]]:
        """Returns explainability metrics showing which features drove the predictions."""
        if self.income_model is None or self.expense_model is None:
            return {}

        inc_imp = {
            col: round(float(imp), 4)
            for col, imp in zip(self.feature_names, self.income_model.feature_importances_)
        }
        exp_imp = {
            col: round(float(imp), 4)
            for col, imp in zip(self.feature_names, self.expense_model.feature_importances_)
        }
        return {
            "income_model": dict(sorted(inc_imp.items(), key=lambda x: x[1], reverse=True)),
            "expense_model": dict(sorted(exp_imp.items(), key=lambda x: x[1], reverse=True)),
        }

    def forecast(self, user_id: int, horizon_months: int = 6) -> Dict[str, Any]:
        """
        High-level orchestrator: Loads data, fits the Random Forest models,
        generates multi-month forecasts, and returns structured analytical results.
        """
        self.fit(user_id)
        predictions = self.predict(horizon_months=horizon_months)

        incomes = [p["predicted_income"] for p in predictions]
        expenses = [p["predicted_expenses"] for p in predictions]
        savings = [p["predicted_savings"] for p in predictions]

        summary = {
            "average_monthly_income": round(float(np.mean(incomes)), 2),
            "average_monthly_expenses": round(float(np.mean(expenses)), 2),
            "average_monthly_savings": round(float(np.mean(savings)), 2),
            "average_savings_rate": round(float(np.mean([p["savings_rate"] for p in predictions])), 1),
            "total_projected_savings": round(float(np.sum(savings)), 2),
        }

        return {
            "user_id": user_id,
            "forecast_horizon_months": horizon_months,
            "historical_months_used": len(self.historical_df) if self.historical_df is not None else 0,
            "forecasts": predictions,
            "summary": summary,
            "feature_importance": self.get_feature_importances(),
        }

    def save_forecast_to_db(self, user_id: int, forecasts: List[Dict[str, Any]]) -> int:
        """
        Persists the ML-generated predictions into the MonthlyCashFlow table as 'forecast' records,
        refreshing prior projections for this user.
        """
        with self._get_session() as session:
            # Clear existing forecasts for this user
            session.query(MonthlyCashFlow).filter(
                MonthlyCashFlow.user_id == user_id,
                MonthlyCashFlow.flow_type == "forecast",
            ).delete()

            # Insert new ML predictions
            new_records = []
            for item in forecasts:
                notes = ", ".join(item.get("insights", [])) if item.get("insights") else "ML RandomForest Projection"
                cf = MonthlyCashFlow(
                    user_id=user_id,
                    month_year=item["month_year"],
                    month_label=item["month_label"],
                    income=item["predicted_income"],
                    expenses=item["predicted_expenses"],
                    savings=item["predicted_savings"],
                    flow_type="forecast",
                    notes=notes,
                )
                new_records.append(cf)

            session.add_all(new_records)
            session.commit()
            return len(new_records)
