import axios from 'axios';
import { mockProfile } from '../data/mockData';

const apiClient = axios.create({
  baseURL: '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProfile = async () => {
  try {
    const res = await apiClient.get('/api/v1/profile');
    return { data: res.data, isLive: true };
  } catch (err) {
    // Fallback to local synthetic data if backend offline
    return {
      data: {
        profile: {
          monthly_salary: mockProfile.metrics.monthlyIncome - 25000,
          additional_income: 25000,
          essential_expenses: 50500,
          discretionary_expenses: 37500,
          current_savings: 200000,
          investments: 2990000,
          existing_loans: mockProfile.metrics.totalLiabilities,
          monthly_emi: 18500,
          emergency_fund: mockProfile.metrics.emergencyFund,
        },
        metrics: {
          total_income: mockProfile.metrics.monthlyIncome,
          total_expenses: mockProfile.metrics.monthlyExpenses,
          monthly_savings: mockProfile.metrics.monthlySavings,
          savings_rate: mockProfile.metrics.savingsRate,
          net_worth: mockProfile.metrics.netWorth,
          debt_to_income: mockProfile.metrics.debtToIncome,
          emergency_runway_months: mockProfile.metrics.emergencyRunwayMonths,
        },
        updated_at: new Date().toISOString(),
      },
      isLive: false,
      error: err.message,
    };
  }
};

export const updateProfile = async (updateData) => {
  try {
    const res = await apiClient.post('/api/v1/profile', updateData);
    return { data: res.data, isLive: true };
  } catch (err) {
    throw new Error(err.response?.data?.detail || err.message || 'Failed to update profile');
  }
};

export const getHealthScore = async () => {
  try {
    const res = await apiClient.get('/api/v1/health-score');
    return { data: res.data, isLive: true };
  } catch (err) {
    return {
      data: {
        overall_score: mockProfile.metrics.healthScore,
        max_score: 100,
        verdict: 'Optimal Financial Health (A+)',
        breakdown: mockProfile.healthBreakdown,
      },
      isLive: false,
    };
  }
};

export const runSimulation = async (scenario) => {
  try {
    const res = await apiClient.post('/api/v1/simulator/run', scenario);
    return { data: res.data, isLive: true };
  } catch (err) {
    // If backend unavailable, compute local deterministic fallback
    const salary = scenario.monthly_salary ?? mockProfile.metrics.monthlyIncome;
    const expenses = scenario.monthly_expenses ?? mockProfile.metrics.monthlyExpenses;
    const newEmi = scenario.new_loan_amount > 0 ? (scenario.new_loan_amount * 0.02) : 0;
    const totalEmi = 18500 + newEmi;
    const savings = Math.max(0, salary - expenses - totalEmi - scenario.monthly_sip_investment);
    const dti = ((totalEmi / salary) * 100).toFixed(1);

    return {
      data: {
        baseline: {
          monthly_income: mockProfile.metrics.monthlyIncome,
          monthly_expenses: mockProfile.metrics.monthlyExpenses,
          monthly_debt_emi: 18500,
          monthly_savings: mockProfile.metrics.monthlySavings,
          savings_rate: mockProfile.metrics.savingsRate,
          debt_to_income: mockProfile.metrics.debtToIncome,
          emergency_runway_months: mockProfile.metrics.emergencyRunwayMonths,
          net_worth_now: mockProfile.metrics.netWorth,
          projected_net_worth_1y: mockProfile.metrics.netWorth * 1.14,
          projected_net_worth_3y: mockProfile.metrics.netWorth * 1.48,
          projected_net_worth_5y: mockProfile.metrics.netWorth * 1.92,
        },
        simulated: {
          monthly_income: salary,
          monthly_expenses: expenses,
          monthly_debt_emi: totalEmi,
          monthly_savings: savings,
          savings_rate: ((savings / salary) * 100).toFixed(1),
          debt_to_income: dti,
          emergency_runway_months: (mockProfile.metrics.emergencyFund / expenses).toFixed(1),
          net_worth_now: mockProfile.metrics.netWorth - scenario.new_loan_amount,
          projected_net_worth_1y: mockProfile.metrics.netWorth * 1.15,
          projected_net_worth_3y: mockProfile.metrics.netWorth * 1.55,
          projected_net_worth_5y: mockProfile.metrics.netWorth * 2.1,
        },
        comparison: {
          monthly_savings_diff: savings - mockProfile.metrics.monthlySavings,
          debt_to_income_diff: dti - mockProfile.metrics.debtToIncome,
          runway_diff_months: 0,
          net_worth_diff_1y: 50000,
          net_worth_diff_3y: 200000,
          net_worth_diff_5y: 550000,
        },
        new_loan_emi: newEmi,
        feasibility_verdict: dti > 35 ? 'High Debt Risk' : 'Optimal Wealth Accelerating',
        verdict_category: dti > 35 ? 'high_risk' : 'optimal',
        recommendations: ['Simulation computed via local client fallback.'],
      },
      isLive: false,
      error: err.message,
    };
  }
};

export const calculateEMI = async (principal, annualInterestRate, tenureMonths) => {
  const res = await apiClient.post('/api/v1/calculators/emi', {
    principal,
    annual_interest_rate: annualInterestRate,
    tenure_months: tenureMonths,
  });
  return res.data;
};

export const calculateSIP = async (monthlyInvestment, annualReturnRate, tenureYears) => {
  const res = await apiClient.post('/api/v1/calculators/sip', {
    monthly_investment: monthlyInvestment,
    annual_return_rate: annualReturnRate,
    tenure_years: tenureYears,
  });
  return res.data;
};
export const getForecast = async (months = 6, persist = false) => {
  try {
    const res = await apiClient.get('/api/v1/forecast', {
      params: {
        months,
        persist,
      },
    });

    return { data: res.data, isLive: true };
  } catch (err) {
    return {
      data: null,
      isLive: false,
      error: err.message,
    };
  }
};
