import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  badgeText,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        {badgeText && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
        <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
