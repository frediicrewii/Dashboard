import React from 'react';
import { formatNumber } from '../utils';
import { useTranslation } from '../App';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type?: 'line' | 'pie';
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, type = 'line' }) => {
  const { t } = useTranslation();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-xl z-50 min-w-[200px]">
      {label && type === 'line' && (
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
          {label}
        </p>
      )}

      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          // Handle both Line (entry.color) and Pie (entry.payload.fill) structures
          const color = entry.color || entry.payload?.fill || '#8884d8';
          const name = entry.name;
          const value = entry.value;
          const percent = entry.payload?.percent; // Available for Pie

          return (
            <div key={index} className="flex flex-col">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {name}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {formatNumber(value)}
                </span>
              </div>
              
              {/* Show percentage for Pie charts */}
              {type === 'pie' && percent !== undefined && (
                <div className="flex justify-between items-center mt-1 pl-5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.shareOfTotal}</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {(percent * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltip;