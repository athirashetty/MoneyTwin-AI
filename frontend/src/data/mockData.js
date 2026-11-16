/**
 * Synthetic Indian Financial Demo Data for MoneyTwin AI
 * Separated cleanly from actual backend integration
 */

export const mockProfile = {
  name: 'Aarav Sharma',
  age: 28,
  occupation: 'Lead Software Engineer',
  location: 'Bengaluru, India',
  currency: 'INR (₹)',
  twinStatus: 'Synchronized (Active Mirror)',
  lastSynced: 'Today at 08:30 PM',
  riskProfile: 'Moderate Aggressive',
  metrics: {
    netWorth: 3060000, // ₹30.60 Lakhs
    netWorthGrowth: 14.8, // % YoY
    monthlyIncome: 210000, // ₹2.10 Lakhs
    monthlyExpenses: 88000, // ₹88,000
    monthlySavings: 122000, // ₹1,22,000
    savingsRate: 58.1, // %
    healthScore: 84, // out of 100
    emergencyFund: 650000, // ₹6.5 Lakhs
    emergencyRunwayMonths: 7.4,
    debtToIncome: 8.8, // %
    totalAssets: 3840000, // ₹38.40 Lakhs
    totalLiabilities: 780000, // ₹7.80 Lakhs (Car Loan)
  },
  healthBreakdown: [
    { factor: 'Savings Rate', score: 95, benchmark: '> 20%', status: 'Optimal', weight: '25%' },
    { factor: 'Debt-to-Income', score: 88, benchmark: '< 30%', status: 'Healthy', weight: '25%' },
    { factor: 'Emergency Runway', score: 92, benchmark: '> 6 months', status: 'Optimal', weight: '20%' },
    { factor: 'Discretionary Ratio', score: 76, benchmark: '< 30%', status: 'Moderate', weight: '15%' },
    { factor: 'Investment Velocity', score: 85, benchmark: '> 30% Inflow', status: 'Healthy', weight: '15%' },
  ],
};

export const mockCashflowMonthly = [
  { month: 'Jun', income: 195000, expenses: 84000, savings: 111000, type: 'actual' },
  { month: 'Jul', income: 195000, expenses: 92000, savings: 103000, type: 'actual' },
  { month: 'Aug', income: 200000, expenses: 85000, savings: 115000, type: 'actual' },
  { month: 'Sep', income: 200000, expenses: 81000, savings: 119000, type: 'actual' },
  { month: 'Oct', income: 225000, expenses: 96000, savings: 129000, type: 'actual' }, // Festive bonus
  { month: 'Nov (Now)', income: 210000, expenses: 88000, savings: 122000, type: 'actual' },
  { month: 'Dec (Twin)', income: 210000, expenses: 86500, savings: 123500, type: 'forecast' },
  { month: 'Jan (Twin)', income: 215000, expenses: 87000, savings: 128000, type: 'forecast' },
  { month: 'Feb (Twin)', income: 215000, expenses: 85000, savings: 130000, type: 'forecast' },
  { month: 'Mar (Twin)', income: 240000, expenses: 94000, savings: 146000, type: 'forecast' }, // Annual appraisal
];

export const mockExpenseCategories = [
  { name: 'Rent & Housing', amount: 32000, percentage: 36.4, color: '#3b82f6' },
  { name: 'Car Loan EMI', amount: 18500, percentage: 21.0, color: '#f59e0b' },
  { name: 'Groceries & Blinkit', amount: 14000, percentage: 15.9, color: '#10b981' },
  { name: 'Dining & Swiggy', amount: 9500, percentage: 10.8, color: '#ec4899' },
  { name: 'Utilities & Broadband', amount: 6000, percentage: 6.8, color: '#8b5cf6' },
  { name: 'Leisure & Shopping', amount: 8000, percentage: 9.1, color: '#06b6d4' },
];

export const mockAssets = [
  { name: 'Equity Mutual Funds (Zerodha Coin)', category: 'Mutual Funds', value: 1680000, returnRate: '14.2% p.a.' },
  { name: 'Direct US & Indian Equities', category: 'Stocks', value: 470000, returnRate: '12.8% p.a.' },
  { name: 'Employees Provident Fund (EPF)', category: 'Retirement', value: 620000, returnRate: '8.25% p.a.' },
  { name: 'Emergency Liquid FD (HDFC Bank)', category: 'Cash & FD', value: 650000, returnRate: '7.1% p.a.' },
  { name: 'Sovereign Gold Bonds (SGB)', category: 'Commodities', value: 420000, returnRate: '11.5% p.a.' },
];

export const mockLiabilities = [
  {
    name: 'HDFC Vehicle Loan (Creta SUV)',
    category: 'Auto Loan',
    principalRemaining: 780000,
    monthlyEmi: 18500,
    interestRate: '8.7% p.a.',
    tenureRemaining: '46 months',
    lender: 'HDFC Bank',
  },
];

export const mockTransactions = [
  {
    id: 'TXN-9021',
    date: '15 Nov 2026',
    merchant: 'TechCorp India Pvt Ltd',
    category: 'Salary',
    type: 'credit',
    amount: 185000,
    paymentMethod: 'NEFT Direct',
    status: 'Completed',
  },
  {
    id: 'TXN-9020',
    date: '14 Nov 2026',
    merchant: 'Zerodha Broking Ltd',
    category: 'Investments',
    type: 'debit',
    amount: 50000,
    paymentMethod: 'UPI Auto-Pay',
    status: 'Completed',
  },
  {
    id: 'TXN-9019',
    date: '12 Nov 2026',
    merchant: 'Prestige Lakeside Habitat (Rent)',
    category: 'Housing',
    type: 'debit',
    amount: 32000,
    paymentMethod: 'IMPS Transfer',
    status: 'Completed',
  },
  {
    id: 'TXN-9018',
    date: '10 Nov 2026',
    merchant: 'HDFC Auto Loan EMI',
    category: 'Debt / Loan',
    type: 'debit',
    amount: 18500,
    paymentMethod: 'NACH Mandate',
    status: 'Completed',
  },
  {
    id: 'TXN-9017',
    date: '08 Nov 2026',
    merchant: 'Blinkit Grocery Store',
    category: 'Groceries',
    type: 'debit',
    amount: 3450,
    paymentMethod: 'UPI (GPay)',
    status: 'Completed',
  },
  {
    id: 'TXN-9016',
    date: '06 Nov 2026',
    merchant: 'Freelance Design Advisory',
    category: 'Side Income',
    type: 'credit',
    amount: 25000,
    paymentMethod: 'Razorpay Payout',
    status: 'Completed',
  },
  {
    id: 'TXN-9015',
    date: '05 Nov 2026',
    merchant: 'Swiggy Gourmet Delivery',
    category: 'Dining Out',
    type: 'debit',
    amount: 1840,
    paymentMethod: 'Credit Card',
    status: 'Completed',
  },
  {
    id: 'TXN-9014',
    date: '03 Nov 2026',
    merchant: 'Bescom Electricity Bill',
    category: 'Utilities',
    type: 'debit',
    amount: 2450,
    paymentMethod: 'BBPS',
    status: 'Completed',
  },
  {
    id: 'TXN-9013',
    date: '02 Nov 2026',
    merchant: 'Cult.fit Fitness Membership',
    category: 'Healthcare',
    type: 'debit',
    amount: 1800,
    paymentMethod: 'Credit Card',
    status: 'Completed',
  },
  {
    id: 'TXN-9012',
    date: '01 Nov 2026',
    merchant: 'Tata Power EV Fast Charging',
    category: 'Transport',
    type: 'debit',
    amount: 1250,
    paymentMethod: 'UPI',
    status: 'Completed',
  },
];

export const mockAdvisorQuestions = [
  'How can I increase my monthly savings without lifestyle stress?',
  'Can I afford a new home loan of ₹50 Lakhs right now?',
  'What will my financial twin look like in 5 years?',
];

export const mockAdvisorResponses = {
  'How can I increase my monthly savings without lifestyle stress?': `Based on your digital twin's cash flow over the last 6 months:

1. **Dining & Delivery Optimization:** You spend ~₹9,500/month on food delivery apps (Swiggy/Zomato). Trimming discretionary takeout by 25% unlocks **₹2,400/month** effortlessly.
2. **Step-Up SIP Velocity:** Directing an automatic 10% annual step-up to your existing Zerodha index SIPs will compound your wealth by an additional **₹14.2 Lakhs** over 7 years without feeling pinch today.
3. **Emergency Fund Realignment:** Your liquid reserve is ₹6.5 Lakhs (7.4 months runway, exceeding the 6-month benchmark). You can safely redirect **₹15,000/month** from cash replenishment into Nifty 50 / Flexi-cap funds.`,

  'Can I afford a new home loan of ₹50 Lakhs right now?': `Here is the stress-test analysis from your financial twin:

- **Estimated EMI:** At 8.5% interest for 20 years, a ₹50 Lakh home loan requires an EMI of **~₹43,391/month**.
- **Existing Debt:** Car loan EMI is ₹18,500/month (ending in 46 months).
- **New Total Debt Commitment:** ₹61,891/month.
- **Projected Debt-to-Income (DTI):** Increases from **8.8% to 29.5%**.
- **Twin Verdict: AFFORDABLE WITH CAUTION.**
  Your DTI will remain below the healthy ceiling of 35%, leaving a monthly surplus of ~₹60,000. However, wait until your car loan has < 12 months left or keep an 8-month emergency runway before signing the sanction letter.`,

  'What will my financial twin look like in 5 years?': `Simulating your current trajectory with 10% salary growth and 12% equity returns:

- **Net Worth (2031):** Projected to reach **₹86.4 Lakhs** (up from ₹30.6 Lakhs today).
- **Debt Free Date:** Car loan paid off in October 2030, freeing up ₹18,500/month into investment capital.
- **Passive Portfolio Income:** Annual dividend & yield projected at **~₹3.4 Lakhs/year**.
- **Financial Freedom Index:** 42% on the FIRE scale for a 35-year milestone.`,
};
