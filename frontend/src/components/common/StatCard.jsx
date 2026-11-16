import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  accentColor = 'text-slate-400',
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 hover:border-slate-700/80 transition-all duration-200 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
            <Icon className={`h-4 w-4 ${accentColor}`} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {value}
        </div>
        {(subtitle || change !== undefined) && (
          <div className="flex items-center space-x-2 text-xs">
            {change !== undefined && (
              <span
                className={`inline-flex items-center font-medium ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                )}
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
