import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EconomicDataPoint } from '../types';
import { SECTOR_COLORS } from '../constants';
import { useTranslation } from '../App';
import ChartTooltip from './ChartTooltip';

interface Props {
  data: EconomicDataPoint[];
  activeSector: string | null;
  onSectorClick: (sector: string) => void;
}

const SectorDistributionChart: React.FC<Props> = ({ data, activeSector, onSectorClick }) => {
  const { t } = useTranslation();
  
  // Filter for the latest date in the dataset
  const processedData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Find latest date
    const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latestDate = sorted[sorted.length - 1].date.getTime();
    const latestItems = data.filter(d => d.date.getTime() === latestDate);

    // Calculate total for percentages
    const total = latestItems.reduce((sum, item) => sum + item.amount, 0);

    return latestItems.map(item => ({
      name: item.sector,
      value: item.amount,
      percent: (item.amount / total) * 100
    })).sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 h-full flex flex-col shadow-sm transition-colors">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.sectorDistribution}</h3>
      <p className="text-xs text-slate-500 mb-6">{t.clickToFilter}</p>
      
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              onClick={(data) => onSectorClick(data.name)}
              className="cursor-pointer outline-none"
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SECTOR_COLORS[entry.name] || '#8884d8'} 
                  // Dim non-selected sectors if a filter is active
                  fillOpacity={activeSector && activeSector !== entry.name ? 0.3 : 1}
                  className="transition-all duration-300 hover:opacity-90 stroke-slate-50 dark:stroke-slate-900"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip type="pie" />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span className={`${activeSector && activeSector !== value ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'} transition-colors`}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorDistributionChart;