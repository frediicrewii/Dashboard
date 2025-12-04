import React from 'react';
import { X, TrendingUp, Activity } from 'lucide-react';
import { EconomicDataPoint } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatNumber } from '../utils';
import { useTranslation } from '../App';

interface Props {
  sector: string;
  data: EconomicDataPoint[];
  onClose: () => void;
  color: string;
}

const SectorModal: React.FC<Props> = ({ sector, data, onClose, color }) => {
  const { t } = useTranslation();
  
  // Filter data for this sector
  const sectorData = data
    .filter(d => d.sector === sector)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (sectorData.length === 0) return null;

  const latest = sectorData[sectorData.length - 1];
  const first = sectorData[0];
  const totalGrowth = ((latest.amount - first.amount) / first.amount) * 100;
  
  // Calculate simple volatility (standard deviation of month-to-month changes)
  let changes = [];
  for(let i = 1; i < sectorData.length; i++) {
    changes.push((sectorData[i].amount - sectorData[i-1].amount) / sectorData[i-1].amount);
  }
  const meanChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance = changes.reduce((a, b) => a + Math.pow(b - meanChange, 2), 0) / changes.length;
  const volatility = Math.sqrt(variance) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{sector}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.sectorDetails}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.amount} (Latest)</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatNumber(latest.amount)}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-green-500" />
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.averageGrowth}</p>
              </div>
              <p className={`text-xl font-bold ${totalGrowth >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {totalGrowth > 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
               <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-blue-500" />
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.volatility}</p>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {volatility.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sectorData}>
                <defs>
                  <linearGradient id="colorSector" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="dateStr" 
                  hide={true}
                />
                <YAxis 
                  hide={false} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  stroke="#94a3b8"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-text)' }}
                  formatter={(val: number) => formatNumber(val)}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={color} 
                  fillOpacity={1} 
                  fill="url(#colorSector)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorModal;