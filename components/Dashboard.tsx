import React, { useMemo, useState } from 'react';
import { EconomicDataPoint, ChartPeriod } from '../types';
import { aggregateDataByDate, formatNumber } from '../utils';
import StatsCard from './StatsCard';
import LineChartComponent from './LineChartComponent';
import SectorDistributionChart from './SectorDistributionChart';
import DataTable from './DataTable';
import SectorModal from './SectorModal';
import { TrendingUp, Users, Wallet, Factory, X, BarChart2, Filter } from 'lucide-react';
import { SECTOR_COLORS } from '../constants';
import { useTranslation } from '../App';

interface Props {
  data: EconomicDataPoint[];
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ChartPeriod>(ChartPeriod.ALL);
  const [activeSector, setActiveSector] = useState<string | null>(null); // For filtering
  const [modalSector, setModalSector] = useState<string | null>(null);   // For modal details

  // Filter Data based on Period
  const periodFilteredData = useMemo(() => {
    if (period === ChartPeriod.ALL) return data;
    
    if (data.length === 0) return [];
    const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latestDate = sorted[sorted.length - 1].date;
    
    const cutoffDate = new Date(latestDate);
    if (period === ChartPeriod.YEAR_1) cutoffDate.setFullYear(latestDate.getFullYear() - 1);
    if (period === ChartPeriod.YEAR_3) cutoffDate.setFullYear(latestDate.getFullYear() - 3);
    if (period === ChartPeriod.YEAR_5) cutoffDate.setFullYear(latestDate.getFullYear() - 5);

    return data.filter(d => d.date >= cutoffDate);
  }, [data, period]);

  const aggregatedData = useMemo(() => aggregateDataByDate(periodFilteredData), [periodFilteredData]);
  
  // Calculate Stats
  const stats = useMemo(() => {
    if (periodFilteredData.length === 0) return null;

    const sortedData = [...periodFilteredData].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latestDate = sortedData[sortedData.length - 1].date.getTime();
    const latestItems = sortedData.filter(d => d.date.getTime() === latestDate);
    
    const uniqueDates = Array.from(new Set(sortedData.map(d => d.date.getTime()))).sort((a, b) => a - b);
    const prevDateTimestamp = uniqueDates[uniqueDates.length - 2];
    const prevItems = prevDateTimestamp ? sortedData.filter(d => d.date.getTime() === prevDateTimestamp) : [];

    const totalVolume = latestItems.reduce((acc, curr) => acc + curr.amount, 0);
    const prevTotalVolume = prevItems.reduce((acc, curr) => acc + curr.amount, 0);
    const totalTrend = prevTotalVolume ? ((totalVolume - prevTotalVolume) / prevTotalVolume) * 100 : 0;

    const industry = latestItems.find(i => i.sector === 'Industry')?.amount || 0;
    const prevIndustry = prevItems.find(i => i.sector === 'Industry')?.amount || 0;
    const industryTrend = prevIndustry ? ((industry - prevIndustry) / prevIndustry) * 100 : 0;

    const individuals = latestItems.find(i => i.sector === 'Individuals')?.amount || 0;
    
    // Most growing sector
    let topGrower = { name: '-', growth: -Infinity };
    latestItems.forEach(item => {
      const prev = prevItems.find(p => p.sector === item.sector);
      if (prev) {
        const growth = ((item.amount - prev.amount) / prev.amount) * 100;
        if (growth > topGrower.growth) {
          topGrower = { name: item.sector, growth };
        }
      }
    });

    return {
      totalVolume,
      totalTrend,
      industry,
      industryTrend,
      individuals,
      topGrower
    };
  }, [periodFilteredData]);

  const handleSectorClick = (sector: string) => {
    setActiveSector(prev => prev === sector ? null : sector);
  };

  if (!stats) return <div className="text-slate-500 dark:text-slate-400 p-10">{t.loading}</div>;

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Active Filter Indicator */}
        <div className="h-10 flex items-center">
          {activeSector ? (
            <div className="flex items-center gap-2 animate-fadeIn">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Filter size={16} />
                {t.filterActive}:
              </span>
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-bold">{activeSector}</span>
                <button 
                  onClick={() => setActiveSector(null)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                  title={t.clearFilter}
                >
                  <X size={14} />
                </button>
              </div>
              <button 
                onClick={() => setModalSector(activeSector)}
                className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <BarChart2 size={16} />
                {t.viewAnalysis}
              </button>
            </div>
          ) : (
             <p className="text-sm text-slate-400 italic flex items-center gap-2">
               <Filter size={16} />
               {t.clickToFilter}
             </p>
          )}
        </div>

        {/* Period Selector */}
        <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
           {[ChartPeriod.YEAR_1, ChartPeriod.YEAR_3, ChartPeriod.YEAR_5, ChartPeriod.ALL].map((p) => (
             <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                period === p 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
             >
               {t[`period_${p}` as keyof typeof t] || p}
             </button>
           ))}
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label={t.totalVolume}
          value={formatNumber(stats.totalVolume)} 
          trend={stats.totalTrend}
          icon={Wallet}
          color="#3b82f6"
        />
        <StatsCard 
          label={t.industryOutput}
          value={formatNumber(stats.industry)} 
          trend={stats.industryTrend}
          icon={Factory}
          color="#8b5cf6"
        />
        <StatsCard 
          label={t.individualContributions}
          value={formatNumber(stats.individuals)} 
          trend={0.5} 
          icon={Users}
          color="#ef4444"
        />
        <StatsCard 
          label={t.topGrowingSector}
          value={stats.topGrower.name} 
          trend={stats.topGrower.growth}
          icon={TrendingUp}
          color="#22c55e"
        />
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        <div className="lg:col-span-2 flex flex-col">
          <LineChartComponent 
            data={aggregatedData} 
            activeSector={activeSector}
            onSectorSelect={handleSectorClick}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <SectorDistributionChart 
            data={periodFilteredData} 
            activeSector={activeSector}
            onSectorClick={handleSectorClick}
          />
        </div>
      </div>

      {/* Bottom Row: Data Table */}
      <div className="w-full">
        <DataTable data={periodFilteredData} activeSector={activeSector} />
      </div>

      {/* Modal */}
      {modalSector && (
        <SectorModal 
          sector={modalSector}
          data={data} // Pass full history
          onClose={() => setModalSector(null)}
          color={SECTOR_COLORS[modalSector] || '#888888'}
        />
      )}
    </div>
  );
};

export default Dashboard;