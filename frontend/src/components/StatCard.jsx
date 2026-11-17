import React from 'react';

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-100',
    iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
    accentText: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  },
  emerald: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
    accentText: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  purple: {
    bg: 'bg-purple-50/70',
    border: 'border-purple-100',
    iconBg: 'bg-purple-600 text-white shadow-purple-500/20',
    accentText: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800'
  },
  cyan: {
    bg: 'bg-cyan-50/70',
    border: 'border-cyan-100',
    iconBg: 'bg-cyan-600 text-white shadow-cyan-500/20',
    accentText: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-800'
  },
  amber: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-100',
    iconBg: 'bg-amber-600 text-white shadow-amber-500/20',
    accentText: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800'
  },
  slate: {
    bg: 'bg-slate-50/80',
    border: 'border-slate-200',
    iconBg: 'bg-slate-700 text-white shadow-slate-500/20',
    accentText: 'text-slate-700',
    badge: 'bg-slate-200 text-slate-800'
  },
  rose: {
    bg: 'bg-rose-50/70',
    border: 'border-rose-100',
    iconBg: 'bg-rose-600 text-white shadow-rose-500/20',
    accentText: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800'
  }
};

export default function StatCard({ 
  title, 
  value, 
  symbol, 
  percentage, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  onClick 
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div 
      onClick={onClick}
      className={`relative p-5 rounded-xl bg-white border ${c.border} shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
            {symbol && (
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${c.badge}`}>
                {symbol}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {percentage !== undefined && (
              <span className={`text-xs font-bold ${c.accentText}`}>
                {percentage}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 leading-tight">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${c.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
