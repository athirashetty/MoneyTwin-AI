import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar, { navItems } from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Overview from './pages/Overview';
import FinancialTwin from './pages/FinancialTwin';
import Transactions from './pages/Transactions';
import CashFlow from './pages/CashFlow';
import Simulator from './pages/Simulator';
import Investments from './pages/Investments';
import Advisor from './pages/Advisor';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [backendData, setBackendData] = useState(null);

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    try {
      const res = await axios.get('/api/health', { timeout: 3000 });
      if (res.data && res.data.status === 'online') {
        setBackendStatus('online');
        setBackendData(res.data);
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const activeNavItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigate={setActiveTab} />;
      case 'twin':
        return <FinancialTwin onNavigate={setActiveTab} />;
      case 'transactions':
        return <Transactions />;
      case 'cashflow':
        return <CashFlow />;
      case 'simulator':
        return <Simulator />;
      case 'investments':
        return <Investments />;
      case 'advisor':
        return <Advisor />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <Topbar
          activeTabTitle={activeNavItem.label}
          backendStatus={backendStatus}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onRefreshHealth={checkBackendHealth}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-400">MoneyTwin AI</span>
              <span>•</span>
              <span>Personal Financial Digital Twin (India Edition)</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Currency: INR (₹)</span>
              <span>•</span>
              <span>Stack: React + Tailwind + Recharts + FastAPI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
