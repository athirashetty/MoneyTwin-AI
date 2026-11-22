import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import CashFlowChart from '../components/charts/CashFlowChart';
import ExpenseDonutChart from '../components/charts/ExpenseDonutChart';
import NetWorthChart from '../components/charts/NetWorthChart';
import {
  mockCashflowMonthly,
  mockExpenseCategories,
  mockProfile,
} from '../data/mockData';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { getForecast } from '../services/api';

export default function CashFlow() {
  const [filterType, setFilterType] = useState('all');
    const [forecastData, setForecastData] = useState([]);
  const [forecastLive, setForecastLive] = useState(false);

    useEffect(() => {
    const loadForecast = async () => {
      const result = await getForecast(6, false);

      if (result.data) {
        setForecastData(result.data.forecasts);
        setForecastLive(result.isLive);
      }
    };

    loadForecast();
  }, []);

  const filteredData = forecastData.length
  ? forecastData.map((item) => ({
      month: item.month_label,
      type: 'forecast',
      income: item.predicted_income,
      expenses: item.predicted_expenses,
      savings: item.predicted_savings,
    }))
  : mockCashflowMonthly.filter((item) => {
      if (filterType === 'actual') return item.type === 'actual';
      if (filterType === 'forecast') return item.type === 'forecast';
      return true;
    });

  const totalIncome = mockProfile.metrics.monthlyIncome;
  const totalExpenses = mockProfile.metrics.monthlyExpenses;
  const netSurplus = mockProfile.metrics.monthlySavings;

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        badge={
          <Badge variant="info" size="sm">
            Cash Flow Diagnostics
          </Badge>
        }
        title="Cash Flow Analytics"
        description="Comprehensive analysis of monthly inflows, lifestyle burns, and net wealth compounding trajectory."
        action={
          <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (10 Mo)
            </button>
            <button
              onClick={() => setFilterType('actual')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterType === 'actual'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Historical Actuals
            </button>
            <button
              onClick={() => setFilterType('forecast')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterType === 'forecast'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Twin Forecast
            </button>
          </div>
        }
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Take-Home Inflow"
          value={formatINR(totalIncome)}
          subtitle="Fixed Salary + Side Payouts"
          change="+4.8% vs last month"
          isPositive={true}
          icon={TrendingUp}
          accentColor="text-teal-400"
        />

        <StatCard
          title="Monthly Operating Outflow"
          value={formatINR(totalExpenses)}
          subtitle="Needs ₹50.5k • Wants ₹37.5k"
          change="-2.1% vs last month"
          isPositive={true}
          icon={Receipt}
          accentColor="text-rose-400"
        />

        <StatCard
          title="Net Monthly Cash Surplus"
          value={formatINR(netSurplus)}
          subtitle={`${mockProfile.metrics.savingsRate}% Savings Velocity`}
          change="+8.3% surplus gain"
          isPositive={true}
          icon={PiggyBank}
          accentColor="text-emerald-400"
        />
      </div>

      {/* Primary Chart: Monthly Inflow vs Outflow */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Income vs Expense Matrix</h2>
            <p className="text-xs text-slate-400">
              Comparing earned capital against lifestyle outflows month-by-month
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              <span>Inflow</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />
              <span>Outflow</span>
            </span>
          </div>
        </div>

        <CashFlowChart data={filteredData} height={300} />
      </div>

      {/* 2-Column Row: Savings Trend & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Trend */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Monthly Savings Trajectory</h2>
            <p className="text-xs text-slate-400">
              Net retained monthly capital directed to investments and liquid reserves
            </p>
          </div>
          <NetWorthChart data={filteredData} height={240} />
        </div>

        {/* Expense Category Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Category Spending Distribution</h2>
            <p className="text-xs text-slate-400">Current month budget allocation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <ExpenseDonutChart data={mockExpenseCategories} height={190} />

            <div className="space-y-2 text-xs">
              {mockExpenseCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-300 truncate">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-white ml-2">
                    {formatINR(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Ledger Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Monthly Cash Flow Summary</h2>
          <p className="text-xs text-slate-400">
            Tabular record of cash flow performance and digital twin estimates
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Inflow</th>
                <th className="py-3 px-3 text-right">Outflow</th>
                <th className="py-3 px-3 text-right">Net Savings</th>
                <th className="py-3 px-3 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockCashflowMonthly.map((row) => {
                const sRate = ((row.savings / row.income) * 100).toFixed(1);
                return (
                  <tr key={row.month} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">{row.month}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={row.type === 'actual' ? 'default' : 'info'}
                        size="sm"
                      >
                        {row.type === 'actual' ? 'Actual' : 'Twin Forecast'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-400">
                      {formatINR(row.income)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-rose-400">
                      {formatINR(row.expenses)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatINR(row.savings)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-400">
                      {sRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
