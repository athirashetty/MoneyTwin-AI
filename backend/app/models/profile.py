from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class FinancialProfile(Base):
    """
    Financial Profile model representing the core Digital Twin state.
    Holds current salary, expenses, liquid savings, investment assets, loans, and emergency reserves.
    """
    __tablename__ = "financial_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    # Core monthly cash inflows and outflows
    monthly_salary: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    additional_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    essential_expenses: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    discretionary_expenses: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Wealth balance sheet items
    current_savings: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    investments: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    existing_loans: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    monthly_emi: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    emergency_fund: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Metadata & Twin synchronization status
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    twin_status: Mapped[str] = mapped_column(
        String(50), default="Synchronized (Active Mirror)", nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship back to User
    user: Mapped["User"] = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return (
            f"<FinancialProfile id={self.id} user_id={self.user_id} "
            f"salary={self.monthly_salary} net_worth_estimate="
            f"{self.current_savings + self.investments + self.emergency_fund - self.existing_loans}>"
        )
