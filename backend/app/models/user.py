from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.profile import FinancialProfile
    from app.models.transaction import Transaction
    from app.models.cashflow import MonthlyCashFlow


class User(Base):
    """
    User model representing an account holder in MoneyTwin AI.
    Serves as the root entity for financial twin profiles, transactions, and cash flows.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=28)
    occupation: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, default="Bengaluru, India")
    risk_profile: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="Moderate Aggressive")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    # 1-to-1 relationship with FinancialProfile
    profile: Mapped[Optional["FinancialProfile"]] = relationship(
        "FinancialProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # 1-to-many relationship with Transaction history
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Transaction.date)",
    )

    # 1-to-many relationship with MonthlyCashFlow records (actual & forecast)
    cashflows: Mapped[List["MonthlyCashFlow"]] = relationship(
        "MonthlyCashFlow",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="MonthlyCashFlow.month_year",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}' full_name='{self.full_name}'>"
