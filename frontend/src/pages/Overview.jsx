import React from 'react';
import {
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Bot,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import CashFlowChart from '../components/charts/CashFlowChart';
import ExpenseDonutChart from '../components/charts/ExpenseDonutChart';
import {
  mockProfile,
  mockCashflowMonthly,
  mockExpenseCategories,
  mockTransactions,
} from '../data/mockData';
import { formatINR, formatCompactINR } from '../utils/formatters';

export default function Overview({ onNavigate }) {
  const { metrics, healthBreakdown } = mockProfile;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800/80 p-6 sm:p-7">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">
                <Sparkles className="h-3 w-3 mr-1 text-emerald-400" />
                Digital Twin Synchronized
              </Badge>
              <span className="text-xs text-slate-400">
                Last updated {mockProfile.lastSynced}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Good evening, {mockProfile.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your financial digital twin reflects a <span className="text-emerald-400 font-semibold">{metrics.savingsRate}% monthly savings rate</span> and a healthy emergency runway of {metrics.emergencyRunwayMonths} months.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('simulator')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-950"
            >
              <Sliders className="h-4 w-4" />
              <span>Launch Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('advisor')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Bot className="h-4 w-4 text-purple-400" />
              <span>Ask Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Net Worth */}
        <StatCard
          title="Total Net Worth"
          value={formatCompactINR(metrics.netWorth)}
          subtitle={`${formatINR(metrics.netWorth)}`}
          change={`+${metrics.netWorthGrowth}% YoY`}
          isPositive={true}
          icon={Wallet}
          accentColor="text-emerald-400"
        />

        {/* Monthly Income */}
        <StatCard
          title="Monthly Income"
          value={formatCompactINR(metrics.monthlyIncome)}
          subtitle="Take-home + Consulting"
          change="+4.8%"
          isPositive={true}
          icon={TrendingUp}
          accentColor="text-teal-400"
        />

        {/* Monthly Expenses */}
        <StatCard
          title="Monthly Expenses"
          value={formatCompactINR(metrics.monthlyExpenses)}
          subtitle={`${((metrics.monthlyExpenses / metrics.monthlyIncome) * 100).toFixed(0)}% of income`}
          change="-2.1%"
          isPositive={true}
          icon={Receipt}
          accentColor="text-rose-400"
        />

        {/* Monthly Savings */}
        <StatCard
          title="Monthly Savings"
          value={formatCompactINR(metrics.monthlySavings)}
          subtitle={`${metrics.savingsRate}% Savings Rate`}
          change="+8.3%"
          isPositive={true}
          icon={PiggyBank}
          accentColor="text-emerald-300"
        />

        {/* Financial Health Score */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 hover:border-slate-700/80 transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
              Health Score
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-emerald-400">
                {metrics.healthScore}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              <Badge variant="success" size="sm" className="ml-auto">
                Optimal
              </Badge>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${metrics.healthScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">Top 12% in your peer cohort</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Row: Cash Flow Chart + Expense Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cash Flow Trends */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Monthly Cash Flow Mirror</span>
                <Badge variant="info" size="sm">
                  Historical & Projected
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking past 6 months vs upcoming digital twin forecast
              </p>
            </div>
            <button
              onClick={() => onNavigate('cashflow')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>View full cashflow</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <CashFlowChart data={mockCashflowMonthly} height={280} />
        </div>

        {/* Right 1 Col: Spending Category Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Expense Distribution</h2>
              <span className="text-xs text-slate-400">Nov 2026</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top spending categories for the current month
            </p>
          </div>

          <ExpenseDonutChart data={mockExpenseCategories} height={190} />

          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            {mockExpenseCategories.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </span>
                <span className="font-semibold text-white">{formatINR(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Health Pillars & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Pillars Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Twin Health Pillars</h2>
            <button
              onClick={() => onNavigate('twin')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Twin details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {healthBreakdown.map((item) => (
              <div key={item.factor} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{item.factor}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">{item.benchmark}</span>
                    <span className="font-bold text-emerald-400">{item.score}/100</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Indian Transactions */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Live Indian financial ledger entries</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>All transactions</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-hidden">
            {mockTransactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="py-3 flex items-center justify-between text-xs hover:bg-slate-900/30 transition px-2 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      txn.type === 'credit'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {txn.merchant.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{txn.merchant}</p>
                    <p className="text-slate-400 text-[11px]">
                      {txn.date} • {txn.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold ${
                      txn.type === 'credit' ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'} {formatINR(txn.amount)}
                  </p>
                  <p className="text-slate-500 text-[10px]">{txn.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
