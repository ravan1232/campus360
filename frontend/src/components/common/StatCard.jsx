import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, change, trend = 'neutral', icon: Icon, gradient = 'from-brand-500 to-indigo-600' }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-brand-500/20`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          {trend === 'up' && (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            </span>
          )}
          {trend === 'neutral' && (
            <span className="flex items-center text-slate-500 dark:text-slate-400">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
            </span>
          )}
          <span className="text-slate-600 dark:text-slate-400">{change}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
