import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Receipt,
  TrendingUp,
  Sliders,
  PieChart,
  MessageSquareCode,
  FileText,
  Settings,
  X,
  Bot,
  ShieldCheck,
} from 'lucide-react';

export const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'twin', label: 'My Financial Twin', icon: Cpu },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
  { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  { id: 'investments', label: 'Investments', icon: PieChart },
  { id: 'advisor', label: 'AI Financial Advisor', icon: MessageSquareCode },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center space-x-1.5">
                <span>MoneyTwin</span>
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Financial Digital Twin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
                {item.id === 'simulator' && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Live
                  </span>
                )}
                {item.id === 'advisor' && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Twin Status & User Profile Box */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Twin Synchronized</span>
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <div className="h-7 w-7 rounded-full bg-emerald-800/50 border border-emerald-600/40 text-emerald-200 text-xs font-bold flex items-center justify-center">
                AS
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Aarav Sharma</p>
                <p className="text-[10px] text-slate-400 truncate">Bengaluru • INR (₹)</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
