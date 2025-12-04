import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from '../App';

interface StatsCardProps {
  label: string;
  value: string;
  trend?: number; // percentage
  icon: LucideIcon;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, trend, icon: Icon, color }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20`, color: color }}>
          <Icon size={24} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-slate-500 dark:text-slate-500 text-sm ml-2">{t.vsLastMonth}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;