import React from 'react';

export default function SectionHeader({
  badge,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 ${className}`}
    >
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-400 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center space-x-3">{action}</div>}
    </div>
  );
}
