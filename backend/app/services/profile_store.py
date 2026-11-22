from datetime import datetime, timezone
from contextlib import contextmanager
from typing import Optional, Union, Generator

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.profile import FinancialProfile
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
    """
    Database-backed store for user financial profiles.
    Replaces in-memory singleton storage with persistent SQLAlchemy ORM operations.
    Supports both direct Session injection and standalone SessionLocal fallback.
    """

    @contextmanager
    def _get_session_context(self, db: Optional[Session] = None) -> Generator[Session, None, None]:
        """
        Yields the injected session if provided; otherwise creates and closes
        a standalone session using SessionLocal.
        """
        if db is not None:
            yield db
        else:
            session = SessionLocal()
            try:
                yield session
            finally:
                session.close()

    def _ensure_default_profile(self, db: Session, user_id: Optional[int] = None) -> FinancialProfile:
        """
        Ensures a User and FinancialProfile exist in the database.
        If empty, automatically initializes the default Demo profile.
        """
        # Ensure database tables exist
        Base.metadata.create_all(bind=engine)

        # 1. Locate user
        user = None
        if user_id is not None:
            user = db.query(User).filter(User.id == user_id).first()
        else:
            user = db.query(User).filter(User.email == "demo@example.com").first()
            if not user:
                user = db.query(User).first()

        # 2. If no user exists, create default user
        if not user:
            user = User(
    email="demo@example.com",
    full_name="Demo User",
    age=28,
    occupation="Software Engineer",
    location="Bengaluru, India",
    risk_profile="Moderate Aggressive",
    is_active=True,
)
            db.add(user)
            db.flush()

        # 3. Locate or create FinancialProfile
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
        if not profile:
            profile = FinancialProfile(
                user_id=user.id,
                monthly_salary=185000.0,
                additional_income=25000.0,
                essential_expenses=50500.0,
                discretionary_expenses=37500.0,
                current_savings=200000.0,
                investments=2990000.0,
                existing_loans=780000.0,
                monthly_emi=18500.0,
                emergency_fund=650000.0,
                currency="INR",
                twin_status="Synchronized (Active Mirror)",
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        return profile

    def _orm_to_pydantic_base(self, profile: FinancialProfile) -> FinancialProfileBase:
        """Converts an ORM model into the Pydantic schema expected by APIs."""
        return FinancialProfileBase(
            monthly_salary=profile.monthly_salary,
            additional_income=profile.additional_income,
            essential_expenses=profile.essential_expenses,
            discretionary_expenses=profile.discretionary_expenses,
            current_savings=profile.current_savings,
            investments=profile.investments,
            existing_loans=profile.existing_loans,
            monthly_emi=profile.monthly_emi,
            emergency_fund=profile.emergency_fund,
        )

    def get_profile(
        self, db: Optional[Session] = None, user_id: Optional[int] = None
    ) -> FinancialProfileBase:
        """Fetch profile from database, returning defensive Pydantic copy."""
        with self._get_session_context(db) as session:
            orm_profile = self._ensure_default_profile(session, user_id)
            return self._orm_to_pydantic_base(orm_profile)

    def update_profile(
        self,
        update: FinancialProfileUpdate,
        db: Optional[Session] = None,
        user_id: Optional[int] = None,
    ) -> FinancialProfileBase:
        """Update existing profile attributes in the database."""
        with self._get_session_context(db) as session:
            orm_profile = self._ensure_default_profile(session, user_id)
            update_dict = update.model_dump(exclude_unset=True)

            for key, val in update_dict.items():
                if val is not None and hasattr(orm_profile, key):
                    setattr(orm_profile, key, float(val))

            orm_profile.updated_at = datetime.utcnow()
            session.commit()
            session.refresh(orm_profile)
            return self._orm_to_pydantic_base(orm_profile)

    def get_calculated_metrics(
        self,
        profile: Union[FinancialProfileBase, FinancialProfile, None] = None,
        db: Optional[Session] = None,
        user_id: Optional[int] = None,
    ) -> CalculatedMetrics:
        """Calculates financial metrics (savings rate, net worth, DTI, runway)."""
        target = profile if profile is not None else self.get_profile(db=db, user_id=user_id)
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

    def get_response(
        self, db: Optional[Session] = None, user_id: Optional[int] = None
    ) -> FinancialProfileResponse:
        """Builds full FinancialProfileResponse from database data."""
        with self._get_session_context(db) as session:
            orm_profile = self._ensure_default_profile(session, user_id)
            profile_schema = self._orm_to_pydantic_base(orm_profile)
            metrics = self.get_calculated_metrics(profile_schema)
            updated_at = (
                orm_profile.updated_at.isoformat()
                if orm_profile.updated_at
                else datetime.now(timezone.utc).isoformat()
            )
            return FinancialProfileResponse(
    user_name=orm_profile.user.full_name,
    profile=profile_schema,
    metrics=metrics,
    updated_at=updated_at,
)


profile_store = ProfileStore()
