import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  Edit3,
  X,
  Check,
  RefreshCw,
  Server,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import { mockAssets, mockLiabilities } from '../data/mockData';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { getProfile, updateProfile } from '../services/api';

export default function FinancialTwin({ onNavigate }) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Editable Form State
  const [formData, setFormData] = useState({
    monthly_salary: '',
    additional_income: '',
    essential_expenses: '',
    discretionary_expenses: '',
    current_savings: '',
    investments: '',
    existing_loans: '',
    monthly_emi: '',
    emergency_fund: '',
  });

  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await getProfile();
      setProfileData(res.data);
      setIsLive(res.isLive);
      setFormData({
        monthly_salary: res.data.profile.monthly_salary,
        additional_income: res.data.profile.additional_income,
        essential_expenses: res.data.profile.essential_expenses,
        discretionary_expenses: res.data.profile.discretionary_expenses,
        current_savings: res.data.profile.current_savings,
        investments: res.data.profile.investments,
        existing_loans: res.data.profile.existing_loans,
        monthly_emi: res.data.profile.monthly_emi,
        emergency_fund: res.data.profile.emergency_fund,
      });
    } catch (err) {
      setErrorMessage('Could not load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? '' : Math.max(0, Number(value)),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    // Input validation
    if (formData.monthly_salary < 0 || formData.essential_expenses < 0) {
      setErrorMessage('Salary and expenses must be non-negative values.');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        monthly_salary: Number(formData.monthly_salary),
        additional_income: Number(formData.additional_income),
        essential_expenses: Number(formData.essential_expenses),
        discretionary_expenses: Number(formData.discretionary_expenses),
        current_savings: Number(formData.current_savings),
        investments: Number(formData.investments),
        existing_loans: Number(formData.existing_loans),
        monthly_emi: Number(formData.monthly_emi),
        emergency_fund: Number(formData.emergency_fund),
      };

      const res = await updateProfile(payload);
      setProfileData(res.data);
      setIsLive(res.isLive);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading Financial Twin Mirror from FastAPI...</p>
      </div>
    );
  }

  const { profile, metrics, updated_at } = profileData;

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        badge={
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Digital Twin Synchronized
            </Badge>
            {isLive ? (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>FastAPI Active</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">
                Offline Mirror
              </span>
            )}
          </div>
        }
        title="My Financial Digital Twin"
        description="A real-time behavioral and balance mirror of your personal financial life, continuously calculating solvency, runway, and net worth trajectory."
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-950"
            >
              <span>Run What-If</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Edit Financial Profile</h2>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.monthly_salary}
                    onChange={(e) => handleInputChange('monthly_salary', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Additional Income (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.additional_income}
                    onChange={(e) => handleInputChange('additional_income', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Essential Expenses (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.essential_expenses}
                    onChange={(e) => handleInputChange('essential_expenses', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Discretionary Expenses (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.discretionary_expenses}
                    onChange={(e) => handleInputChange('discretionary_expenses', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Liquid Cash Savings (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.current_savings}
                    onChange={(e) => handleInputChange('current_savings', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Investments (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.investments}
                    onChange={(e) => handleInputChange('investments', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Outstanding Loans (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.existing_loans}
                    onChange={(e) => handleInputChange('existing_loans', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Monthly Debt EMI (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.monthly_emi}
                    onChange={(e) => handleInputChange('monthly_emi', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-medium">Emergency Reserve Fund (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.emergency_fund}
                    onChange={(e) => handleInputChange('emergency_fund', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Recalculating...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Twin Updated!</span>
                    </>
                  ) : (
                    <span>Save & Recalculate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persona Header Card */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-xl shadow-emerald-950">
            AS
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Aarav Sharma</h2>
              <Badge variant="default" size="sm">
                Age 28 • Lead SWE
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Bengaluru, India • Currency: INR (₹)
            </p>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
              <span>Net Worth: <strong className="text-emerald-400 font-bold">{formatCompactINR(metrics.net_worth)}</strong></span>
              <span>•</span>
              <span>Savings Rate: <strong className="text-emerald-400">{metrics.savings_rate}%</strong></span>
              <span>•</span>
              <span>Runway: <strong className="text-slate-300">{metrics.emergency_runway_months} Mo</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Twin Solvency Status
            </span>
            <span className="text-lg font-black text-emerald-400">
              High Solvency (A+)
            </span>
            <p className="text-xs text-slate-400">
              DTI is {metrics.debt_to_income}% (Safe &lt; 30%)
            </p>
          </div>
        </div>
      </div>

      {/* 6 Real-Time Calculated Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Income */}
        <StatCard
          title="Monthly Income"
          value={formatINR(metrics.total_income)}
          subtitle={`₹${profile.monthly_salary.toLocaleString('en-IN')} Base + ₹${profile.additional_income.toLocaleString('en-IN')} Side`}
          change="+4.8%"
          isPositive={true}
          icon={TrendingUp}
          accentColor="text-teal-400"
        />

        {/* Expenses */}
        <StatCard
          title="Monthly Expenses"
          value={formatINR(metrics.total_expenses)}
          subtitle={`Needs ₹${profile.essential_expenses.toLocaleString('en-IN')} | Wants ₹${profile.discretionary_expenses.toLocaleString('en-IN')}`}
          change="-2.1%"
          isPositive={true}
          icon={Receipt}
          accentColor="text-rose-400"
        />

        {/* Savings */}
        <StatCard
          title="Monthly Savings"
          value={formatINR(metrics.monthly_savings)}
          subtitle={`${metrics.savings_rate}% Savings Velocity`}
          change="+8.3%"
          isPositive={true}
          icon={PiggyBank}
          accentColor="text-emerald-400"
        />

        {/* Total Assets */}
        <StatCard
          title="Liquid Cash & Investments"
          value={formatINR(profile.current_savings + profile.investments)}
          subtitle={`Savings ₹${profile.current_savings.toLocaleString('en-IN')} + Portfolio`}
          change="+12.5%"
          isPositive={true}
          icon={Wallet}
          accentColor="text-sky-400"
        />

        {/* Liabilities */}
        <StatCard
          title="Outstanding Loans"
          value={formatINR(profile.existing_loans)}
          subtitle={`Monthly EMI: ₹${profile.monthly_emi.toLocaleString('en-IN')}`}
          change="-4.2%"
          isPositive={true}
          icon={AlertCircle}
          accentColor="text-amber-400"
        />

        {/* Emergency Fund */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 hover:border-slate-700/80 transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
              Emergency Fund
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {formatINR(profile.emergency_fund)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Runway: <strong className="text-emerald-400 font-bold">{metrics.emergency_runway_months} Months</strong></span>
              <span>Benchmark: 6.0 Months</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (metrics.emergency_runway_months / 6.0) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation & Liabilities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Asset Inventory</h2>
              <p className="text-xs text-slate-400">Current market valuation across portfolio</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Total: {formatCompactINR(profile.current_savings + profile.investments + profile.emergency_fund)}
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {mockAssets.map((asset) => (
              <div key={asset.name} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{asset.name}</p>
                  <p className="text-slate-400 text-[11px]">{asset.category} • Yield: {asset.returnRate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatINR(asset.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active Debt & Liabilities</h2>
              <p className="text-xs text-slate-400">Monthly debt commitments and amortized principal</p>
            </div>
            <span className="text-xs font-bold text-amber-400">
              Total: {formatCompactINR(profile.existing_loans)}
            </span>
          </div>

          <div className="space-y-4">
            {mockLiabilities.map((loan) => (
              <div
                key={loan.name}
                className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">{loan.name}</span>
                  <Badge variant="warning" size="sm">
                    {loan.interestRate}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Remaining Principal</span>
                    <span className="font-bold text-white">{formatINR(profile.existing_loans)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Monthly EMI</span>
                    <span className="font-bold text-rose-400">{formatINR(profile.monthly_emi)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Remaining Tenure</span>
                    <span className="font-bold text-slate-300">{loan.tenureRemaining}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-emerald-950/20 border border-emerald-800/40 p-3 flex items-start space-x-3 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-slate-300 leading-relaxed">
                Your debt-to-income ratio is <strong className="text-emerald-400">{metrics.debt_to_income}%</strong>, within safe parameters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
