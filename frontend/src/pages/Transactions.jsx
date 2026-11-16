import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import { mockTransactions } from '../data/mockData';
import { formatINR } from '../utils/formatters';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const categories = ['All', 'Salary', 'Investments', 'Housing', 'Debt / Loan', 'Groceries', 'Dining Out', 'Utilities'];

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch =
      txn.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || txn.category.includes(selectedCategory);

    const matchesType =
      selectedType === 'All' ||
      (selectedType === 'credit' && txn.type === 'credit') ||
      (selectedType === 'debit' && txn.type === 'debit');

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalCredit = mockTransactions
    .filter((t) => t.type === 'credit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDebit = mockTransactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        badge={
          <Badge variant="default" size="sm">
            Indian Ledger Mirror
          </Badge>
        }
        title="Transaction Records"
        description="Comprehensive ledger of verified bank, UPI, and investment transactions synced to your digital twin."
        action={
          <button
            onClick={() => alert('Exporting ledger CSV (Prototype)...')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase">
              Total Inflow Recorded
            </span>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              +{formatINR(totalCredit)}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase">
              Total Outflow Recorded
            </span>
            <p className="text-xl font-bold text-white mt-1">
              -{formatINR(totalDebit)}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase">
              Synced Transactions
            </span>
            <p className="text-xl font-bold text-teal-400 mt-1">
              {mockTransactions.length} Verified Entries
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <Receipt className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by merchant, category, or payment mode (e.g. Swiggy, UPI)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setSelectedType('All')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                selectedType === 'All' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('credit')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                selectedType === 'credit' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              Credits Only
            </button>
            <button
              onClick={() => setSelectedType('debit')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                selectedType === 'debit' ? 'bg-slate-800 text-rose-400' : 'text-slate-400'
              }`}
            >
              Debits Only
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 mr-1 shrink-0 font-medium">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition text-[11px] font-medium ${
                selectedCategory === cat
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80 bg-slate-950/40">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Merchant / Entity</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {txn.date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {txn.merchant}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="default" size="sm">
                        {txn.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-[11px] text-emerald-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          txn.type === 'credit'
                            ? 'text-emerald-400'
                            : 'text-white'
                        }
                      >
                        {txn.type === 'credit' ? '+' : '-'} {formatINR(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
