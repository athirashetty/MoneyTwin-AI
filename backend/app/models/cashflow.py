from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class MonthlyCashFlow(Base):
    """
    Monthly Cash Flow model representing aggregated cashflow records.
    Captures both historical actual cash flows and forward-looking digital twin forecasts.
    """
    __tablename__ = "monthly_cashflows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    month_year: Mapped[str] = mapped_column(
        String(7), nullable=False, index=True
    )  # Format 'YYYY-MM', e.g., '2026-11'
    month_label: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # e.g., 'Nov (Now)', 'Dec (Twin)'
    income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    expenses: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    savings: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    flow_type: Mapped[str] = mapped_column(
        String(20), default="actual", nullable=False
    )  # 'actual' or 'forecast'
    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship back to User
    user: Mapped["User"] = relationship("User", back_populates="cashflows")

    def __repr__(self) -> str:
        return (
            f"<MonthlyCashFlow month='{self.month_year}' type='{self.flow_type}' "
            f"income={self.income} expenses={self.expenses} savings={self.savings}>"
        )
