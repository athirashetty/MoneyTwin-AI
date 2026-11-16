import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatINR } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3 shadow-xl backdrop-blur text-xs space-y-1 min-w-[140px]">
        <div className="flex items-center space-x-1.5 font-semibold text-white">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <p className="font-bold text-white text-sm">{formatINR(data.amount)}</p>
        <p className="text-slate-400">{data.percentage}% of total expenses</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseDonutChart({ data, height = 240 }) {
  const totalExpense = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="relative" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius="65%"
            outerRadius="90%"
            paddingAngle={3}
            stroke="#0b0f17"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Total Spent
        </span>
        <span className="text-lg font-bold text-white tracking-tight">
          {formatINR(totalExpense)}
        </span>
      </div>
    </div>
  );
}
