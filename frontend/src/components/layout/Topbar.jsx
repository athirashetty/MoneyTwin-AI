import React from 'react';
import { Menu, Activity, RefreshCw, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import Badge from '../common/Badge';

export default function Topbar({
  activeTabTitle,
  backendStatus,
  onOpenMobileMenu,
  onRefreshHealth,
}) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            MoneyTwin
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-white tracking-tight">
            {activeTabTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Synthetic Demo Data Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-800">
          <Database className="h-3 w-3 text-teal-400" />
          <span>Synthetic Twin Model</span>
        </div>

        {/* Backend API Connectivity Indicator */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
            backendStatus === 'online'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70'
              : backendStatus === 'checking'
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/70'
              : 'bg-rose-950/60 text-rose-300 border-rose-800/70'
          }`}
        >
          {backendStatus === 'online' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">FastAPI: Connected</span>
              <span className="sm:hidden">API Online</span>
            </>
          ) : backendStatus === 'checking' ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden sm:inline">FastAPI: Standby</span>
              <span className="sm:hidden">Offline</span>
            </>
          )}
        </div>

        <button
          onClick={onRefreshHealth}
          title="Refresh connection status"
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
