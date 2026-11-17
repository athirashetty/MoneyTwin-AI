#!/usr/bin/env python3
"""
CLI Script to generate synthetic Indian personal financial records for MoneyTwin AI.

Usage:
    cd backend
    python scripts/generate_synthetic_data.py --months 24 --forecast-months 4 --seed 42

Options:
    --months           Number of historical transaction months (default: 24)
    --forecast-months  Number of future forecast months (default: 4)
    --seed             Random seed for deterministic generation (default: 42)
    --no-clear         Preserve existing records instead of wiping first
    --export-csv       Export generated transactions into a CSV file
"""

import argparse
import os
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pandas as pd
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models import User, FinancialProfile, Transaction, MonthlyCashFlow
from app.ml.synthetic import FinancialDataGenerator, PERSONAS


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate realistic Indian financial transaction data for MoneyTwin AI."
    )
    parser.add_argument(
        "--months",
        type=int,
        default=24,
        help="Number of historical months of transactions to synthesize (default: 24)",
    )
    parser.add_argument(
        "--forecast-months",
        type=int,
        default=4,
        help="Number of forward-looking forecast months to project (default: 4)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)",
    )
    parser.add_argument(
        "--no-clear",
        action="store_true",
        help="Do not wipe existing DB records before inserting",
    )
    parser.add_argument(
        "--export-csv",
        type=str,
        default=None,
        help="Path to export generated transactions DataFrame to CSV",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    print("=" * 70)
    print("🚀 MoneyTwin AI - Synthetic Indian Financial Data Generator")
    print("=" * 70)
    print(f"• History Horizon   : {args.months} months")
    print(f"• Forecast Horizon  : {args.forecast_months} months")
    print(f"• Random Seed       : {args.seed}")
    print(f"• Clear Existing DB : {not args.no_clear}")
    print("-" * 70)

    # Initialize generator
    generator = FinancialDataGenerator(seed=args.seed)

    # Database population
    db = SessionLocal()
    try:
        print("⏳ Generating records and populating database...")
        stats = generator.populate_database(
            db=db,
            clear_existing=not args.no_clear,
            months_history=args.months,
            months_forecast=args.forecast_months,
        )

        print("\n✅ Database Population Completed Successfully:")
        print(f"   👤 Users Created         : {stats['users']}")
        print(f"   📊 Financial Profiles    : {stats['profiles']}")
        print(f"   💳 Transactions Generated: {stats['transactions']}")
        print(f"   📈 Cash Flow Statements  : {stats['cashflows']}")

        # Print summary breakdown per user
        users = db.query(User).all()
        print("\n" + "=" * 70)
        print("👥 Generated User Personas & Profiles:")
        print("=" * 70)
        for u in users:
            p = u.profile
            txn_count = len(u.transactions)
            total_credits = sum(t.amount for t in u.transactions if t.type == "credit")
            total_debits = sum(t.amount for t in u.transactions if t.type == "debit")
            print(
                f"\n📌 {u.full_name} ({u.email})\n"
                f"   Role & City   : {u.occupation} | {u.location}\n"
                f"   Risk Profile  : {u.risk_profile}\n"
                f"   Monthly Salary: ₹{p.monthly_salary:,.2f} (Addl: ₹{p.additional_income:,.2f})\n"
                f"   Investments   : ₹{p.investments:,.2f} | Savings: ₹{p.current_savings:,.2f}\n"
                f"   Debt Principal: ₹{p.existing_loans:,.2f} (Monthly EMI: ₹{p.monthly_emi:,.2f})\n"
                f"   Transactions  : {txn_count} records (Total Inflow: ₹{total_credits:,.2f} | Outflow: ₹{total_debits:,.2f})"
            )

        # Category spend distribution for the primary user (Aarav Sharma)
        primary_user = db.query(User).filter_by(email="aarav.sharma@example.com").first()
        if primary_user:
            debit_txns = [t for t in primary_user.transactions if t.type == "debit"]
            cat_df = pd.DataFrame([{"category": t.category, "amount": t.amount} for t in debit_txns])
            if not cat_df.empty:
                cat_summary = cat_df.groupby("category")["amount"].sum().sort_values(ascending=False)
                print("\n" + "=" * 70)
                print(f"📊 Aarav Sharma - Historical Expense Distribution ({len(debit_txns)} Debits):")
                print("=" * 70)
                total_spend = cat_summary.sum()
                for cat, amt in cat_summary.items():
                    pct = (amt / total_spend) * 100
                    bar = "█" * int(pct / 4)
                    print(f"   {cat:<18}: ₹{amt:>11,.2f} ({pct:>5.1f}%) {bar}")

        # Optional CSV export
        if args.export_csv:
            all_txns = db.query(Transaction).all()
            export_data = [
                {
                    "ref": t.transaction_ref,
                    "user_id": t.user_id,
                    "date": t.date.isoformat(),
                    "merchant": t.merchant,
                    "category": t.category,
                    "type": t.type,
                    "amount": t.amount,
                    "payment_method": t.payment_method,
                    "status": t.status,
                    "description": t.description,
                    "is_recurring": t.is_recurring,
                }
                for t in all_txns
            ]
            df = pd.DataFrame(export_data)
            csv_path = Path(args.export_csv).resolve()
            csv_path.parent.mkdir(parents=True, exist_ok=True)
            df.to_csv(csv_path, index=False)
            print(f"\n💾 Exported {len(df)} transactions to CSV at: {csv_path}")

        print("\n🎉 Synthetic data generation finished successfully.\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during synthetic data generation: {e}", file=sys.stderr)
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    main()
