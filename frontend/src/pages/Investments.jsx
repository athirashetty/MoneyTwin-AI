import React from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import StatCard from '../components/common/StatCard';
import { mockAssets, mockProfile } from '../data/mockData';
import { formatINR, formatCompactINR } from '../utils/formatters';

const activeSips = [
  { name: 'UTI Nifty 50 Index Fund Direct-Growth', category: 'Large Cap Index', amount: 25000, date: '5th of every month', returnRate: '13.8% (3Y)' },
  { name: 'Parag Parikh Flexi Cap Fund Direct-Growth', category: 'Flexi Cap Equity', amount: 15000, date: '10th of every month', returnRate: '18.4% (3Y)' },
  { name: 'Tata Digital India Fund Direct-Growth', category: 'Thematic Tech', amount: 10000, date: '15th of every month', returnRate: '21.2% (3Y)' },
];

export default function Investments() {
  const totalInvested = mockAssets.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        badge={
          <Badge variant="info" size="sm">
            Wealth Compounding Engine
          </Badge>
        }
        title="Investment Portfolio"
        description="Comprehensive asset management across Indian Equities, Mutual Funds, Sovereign Gold, and Debt."
        action={
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Total Active SIP:</span>
            <Badge variant="success" size="md">
              ₹50,000 / month
            </Badge>
          </div>
        }
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={formatCompactINR(totalInvested)}
          subtitle={`${formatINR(totalInvested)} across 5 classes`}
          change="+14.2% XIRR"
          isPositive={true}
          icon={TrendingUp}
          accentColor="text-emerald-400"
        />

        <StatCard
          title="Monthly SIP Velocity"
          value="₹50,000"
          subtitle="3 Active Automated SIPs"
          change="+10% Step-Up due in Dec"
          isPositive={true}
          icon={Layers}
          accentColor="text-teal-400"
        />

        <StatCard
          title="5-Year Projected Value"
          value="₹86.4 L"
          subtitle="At conservative 12.5% CAGR"
          change="+₹48 Lakhs wealth delta"
          isPositive={true}
          icon={Sparkles}
          accentColor="text-purple-400"
        />
      </div>

      {/* Asset Allocation Inventory Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Asset Class Breakdown</h2>
          <span className="text-xs text-slate-400">Target Allocation: 70% Equity / 30% Debt & Gold</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {mockAssets.map((asset) => {
            const share = ((asset.value / totalInvested) * 100).toFixed(1);
            return (
              <div key={asset.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-white">{asset.name}</p>
                  <p className="text-slate-400 text-[11px]">
                    Category: <span className="text-slate-300">{asset.category}</span> • Expected CAGR: <span className="text-emerald-400 font-medium">{asset.returnRate}</span>
                  </p>
                </div>
                <div className="sm:text-right space-y-1">
                  <p className="font-bold text-white text-sm">{formatINR(asset.value)}</p>
                  <div className="flex items-center sm:justify-end space-x-2">
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${share}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{share}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Systematic Investment Plans (SIP) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Automated Monthly SIPs</h2>
            <p className="text-xs text-slate-400">Configured via Zerodha Coin & BSE StarMF</p>
          </div>
          <Badge variant="success" size="sm">
            3 Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeSips.map((sip) => (
            <div key={sip.name} className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400 block">
                  {sip.category}
                </span>
                <p className="font-semibold text-white text-xs line-clamp-2">{sip.name}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Monthly Allocation</span>
                  <span className="font-bold text-emerald-400">{formatINR(sip.amount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Execution Date</span>
                  <span className="text-slate-300 font-medium">{sip.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
