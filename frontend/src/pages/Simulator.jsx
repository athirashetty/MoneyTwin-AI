import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Receipt,
  PiggyBank,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Info,
  Calendar,
  RefreshCw,
  Server,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { getProfile, runSimulation } from '../services/api';

const ProjectionTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-white border-b border-slate-800 pb-1">{label} Horizon</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between space-x-3">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-bold text-white">{formatINR(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Simulator() {
  const [profileData, setProfileData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Scenario Controls
  const [salaryDeltaPercent, setSalaryDeltaPercent] = useState(15);
  const [expenseDelta, setExpenseDelta] = useState(10000);
  const [newLoanAmount, setNewLoanAmount] = useState(0);
  const [newLoanRate, setNewLoanRate] = useState(8.5);
  const [newLoanTenure, setNewLoanTenure] = useState(48);
  const [extraSip, setExtraSip] = useState(15000);

  // Load baseline profile
  const fetchBaselineAndSimulate = useCallback(async () => {
    try {
      const pRes = await getProfile();
      setProfileData(pRes.data);
      setIsLiveApi(pRes.isLive);

      const baseSalary = pRes.data.profile.monthly_salary;
      const baseExpenses = pRes.data.profile.essential_expenses + pRes.data.profile.discretionary_expenses;

      // Initial simulation
      const scenario = {
        monthly_salary: Math.round(baseSalary * (1 + salaryDeltaPercent / 100)),
        monthly_expenses: Math.round(baseExpenses + expenseDelta),
        new_loan_amount: newLoanAmount,
        new_loan_interest_rate: newLoanRate,
        loan_tenure_months: newLoanTenure,
        monthly_sip_investment: extraSip,
      };

      setIsSimulating(true);
      const sRes = await runSimulation(scenario);
      setSimResult(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  }, [salaryDeltaPercent, expenseDelta, newLoanAmount, newLoanRate, newLoanTenure, extraSip]);

  useEffect(() => {
    fetchBaselineAndSimulate();
  }, [fetchBaselineAndSimulate]);

  const handleReset = () => {
    setSalaryDeltaPercent(0);
    setExpenseDelta(0);
    setNewLoanAmount(0);
    setNewLoanRate(8.5);
    setNewLoanTenure(48);
    setExtraSip(0);
  };

  const chartData = simResult
    ? [
        {
          horizon: 'Now',
          Baseline: simResult.baseline.net_worth_now,
          Simulated: simResult.simulated.net_worth_now,
        },
        {
          horizon: '1 Year',
          Baseline: simResult.baseline.projected_net_worth_1y,
          Simulated: simResult.simulated.projected_net_worth_1y,
        },
        {
          horizon: '3 Years',
          Baseline: simResult.baseline.projected_net_worth_3y,
          Simulated: simResult.simulated.projected_net_worth_3y,
        },
        {
          horizon: '5 Years',
          Baseline: simResult.baseline.projected_net_worth_5y,
          Simulated: simResult.simulated.projected_net_worth_5y,
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        badge={
          <div className="flex items-center space-x-2">
            <Badge variant="purple" size="sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Digital Twin Scenario Engine
            </Badge>
            {isLiveApi && (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>FastAPI Simulator Connected</span>
              </span>
            )}
          </div>
        }
        title="What-If Financial Decision Simulator"
        description="Stress-test prospective promotions, new home loans, lifestyle changes, or higher SIP investments before spending real money. The original twin profile is never modified."
        action={
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Baseline</span>
          </button>
        }
      />

      {/* Main Grid: Controls on Left, Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scenario Controls (5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-6">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>Simulation Controls</span>
            </h2>
            {isSimulating && (
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            )}
          </div>

          {/* Control 1: Monthly Salary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Salary Adjustment</span>
              <span className="font-bold text-emerald-400">
                {salaryDeltaPercent >= 0 ? `+${salaryDeltaPercent}%` : `${salaryDeltaPercent}%`}
                {simResult && ` (${formatINR(simResult.simulated.monthly_income)})`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="60"
              step="5"
              value={salaryDeltaPercent}
              onChange={(e) => setSalaryDeltaPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-20% (Pay Cut)</span>
              <span>Baseline</span>
              <span>+60% (Promotion)</span>
            </div>
          </div>

          {/* Control 2: Monthly Expenses Change */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Expense Adjustment</span>
              <span className={`font-bold ${expenseDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {expenseDelta >= 0 ? `+${formatINR(expenseDelta)}` : formatINR(expenseDelta)}
              </span>
            </div>
            <input
              type="range"
              min="-20000"
              max="50000"
              step="2000"
              value={expenseDelta}
              onChange={(e) => setExpenseDelta(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-₹20k (Frugal)</span>
              <span>No Change</span>
              <span>+₹50k (Lifestyle Inflation)</span>
            </div>
          </div>

          {/* Control 3: New Loan Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">New Loan Principal</span>
              <span className="font-bold text-amber-400">
                {newLoanAmount === 0 ? 'No New Loan' : formatINR(newLoanAmount)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5000000"
              step="100000"
              value={newLoanAmount}
              onChange={(e) => setNewLoanAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>₹25 Lakhs</span>
              <span>₹50 Lakhs</span>
            </div>
          </div>

          {/* Loan Interest Rate & Tenure (conditionally active) */}
          {newLoanAmount > 0 && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Interest Rate: {newLoanRate}%</label>
                <input
                  type="range"
                  min="6.5"
                  max="14.0"
                  step="0.5"
                  value={newLoanRate}
                  onChange={(e) => setNewLoanRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded cursor-pointer accent-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Tenure: {newLoanTenure} Mo</label>
                <input
                  type="range"
                  min="12"
                  max="240"
                  step="12"
                  value={newLoanTenure}
                  onChange={(e) => setNewLoanTenure(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded cursor-pointer accent-amber-400"
                />
              </div>
              <div className="col-span-2 pt-1 text-[11px] text-amber-300">
                Calculated New Loan EMI: <strong>{formatINR(simResult?.new_loan_emi || 0)}/mo</strong>
              </div>
            </div>
          )}

          {/* Control 4: Additional Monthly SIP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Extra Monthly SIP</span>
              <span className="font-bold text-teal-400">
                +{formatINR(extraSip)}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40000"
              step="2500"
              value={extraSip}
              onChange={(e) => setExtraSip(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>+₹20,000</span>
              <span>+₹40,000/mo</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison & Projections (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Feasibility Verdict Banner */}
          {simResult && (
            <div
              className={`rounded-2xl border p-5 space-y-2 transition-all ${
                simResult.verdict_category === 'optimal'
                  ? 'bg-emerald-950/30 border-emerald-800/70 text-emerald-300'
                  : simResult.verdict_category === 'caution'
                  ? 'bg-amber-950/30 border-amber-800/70 text-amber-300'
                  : 'bg-rose-950/30 border-rose-800/70 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold">
                  Twin Decision Feasibility
                </span>
                <Badge
                  variant={
                    simResult.verdict_category === 'optimal'
                      ? 'success'
                      : simResult.verdict_category === 'caution'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {simResult.verdict_category.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-white font-medium">
                {simResult.feasibility_verdict}
              </p>
              {simResult.recommendations.length > 0 && (
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-1 pt-1">
                  {simResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Comparison Metrics Table */}
          {simResult && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Baseline Reality vs. Simulated Twin
                </h3>
                <span className="text-xs text-slate-400">Exact Mathematical Deltas</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Monthly Inflow */}
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Monthly Inflow</span>
                  <span className="font-semibold text-slate-300 text-center">
                    {formatINR(simResult.baseline.monthly_income)}
                  </span>
                  <span className="font-bold text-white text-right">
                    {formatINR(simResult.simulated.monthly_income)}
                  </span>
                </div>

                {/* Monthly Expenses */}
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Monthly Outflow</span>
                  <span className="font-semibold text-slate-300 text-center">
                    {formatINR(simResult.baseline.monthly_expenses)}
                  </span>
                  <span className="font-bold text-white text-right">
                    {formatINR(simResult.simulated.monthly_expenses)}
                  </span>
                </div>

                {/* Monthly Savings */}
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Monthly Retained Savings</span>
                  <span className="font-semibold text-slate-300 text-center">
                    {formatINR(simResult.baseline.monthly_savings)}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">
                      {formatINR(simResult.simulated.monthly_savings)}
                    </span>
                    <span
                      className={`text-[10px] ${
                        simResult.comparison.monthly_savings_diff >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simResult.comparison.monthly_savings_diff >= 0 ? '+' : ''}
                      {formatINR(simResult.comparison.monthly_savings_diff)}/mo
                    </span>
                  </div>
                </div>

                {/* Debt-to-Income */}
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Debt-to-Income (DTI)</span>
                  <span className="font-semibold text-slate-300 text-center">
                    {simResult.baseline.debt_to_income}%
                  </span>
                  <div className="text-right">
                    <span
                      className={`font-bold block ${
                        simResult.simulated.debt_to_income > 35
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {simResult.simulated.debt_to_income}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Delta: {simResult.comparison.debt_to_income_diff >= 0 ? '+' : ''}
                      {simResult.comparison.debt_to_income_diff}%
                    </span>
                  </div>
                </div>

                {/* Emergency Runway */}
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Emergency Runway</span>
                  <span className="font-semibold text-slate-300 text-center">
                    {simResult.baseline.emergency_runway_months} Mo
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-white block">
                      {simResult.simulated.emergency_runway_months} Mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1, 3, 5-Year Projected Net Worth Chart */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Net Worth Projections (1, 3 & 5 Years)
                </h3>
                <p className="text-xs text-slate-400">
                  Compounding with 12% equity CAGR and simulated wealth velocity
                </p>
              </div>
              {simResult && (
                <Badge variant="success" size="sm">
                  3Y Delta: {simResult.comparison.net_worth_diff_3y >= 0 ? '+' : ''}
                  {formatCompactINR(simResult.comparison.net_worth_diff_3y)}
                </Badge>
              )}
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="horizon" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => formatCompactINR(val)}
                  />
                  <Tooltip content={<ProjectionTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                  <Bar name="Baseline Net Worth" dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar name="Simulated Twin Net Worth" dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
