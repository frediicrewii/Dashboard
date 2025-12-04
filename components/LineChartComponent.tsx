import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts';
import { AggregatedData } from '../types';
import { SECTOR_COLORS, SECTOR_TRANSLATIONS } from '../constants';
import { useTranslation } from '../App';
import ChartTooltip from './ChartTooltip';

interface Props {
  data: AggregatedData[];
  activeSector: string | null;
  onSectorSelect: (sector: string) => void;
}

const LineChartComponent: React.FC<Props> = ({ data, activeSector, onSectorSelect }) => {
  const { t } = useTranslation();
  const allSectors = Object.values(SECTOR_TRANSLATIONS);
  
  // Default visible set
  const [visibleSectors, setVisibleSectors] = useState<string[]>([
    'Industry', 
    'Agriculture', 
    'Individuals',
    'Trade & Services'
  ]);

  const toggleSector = (sector: string) => {
    // If we are in "Filter Mode" (activeSector is set), clicking a toggle 
    // should probably switch the filter or clear it? 
    // Let's make it consistent: Top toggles affect "Default view", 
    // but if activeSector is set, it overrides everything.
    if (activeSector) {
      onSectorSelect(sector);
    } else {
      setVisibleSectors(prev => 
        prev.includes(sector) 
          ? prev.filter(s => s !== sector)
          : [...prev, sector]
      );
    }
  };

  // If a sector is active, we only want to show that one.
  const sectorsToRender = activeSector ? [activeSector] : visibleSectors;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 h-full flex flex-col shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.growthTrends}</h3>
           <p className="text-xs text-slate-500 mt-1">{activeSector ? t.filterActive : t.clickToFilter}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allSectors.map(sector => (
            <button
              key={sector}
              onClick={() => toggleSector(sector)}
              className={`text-xs px-2 py-1 rounded-full border transition-all duration-200 ${
                (activeSector === sector) || (!activeSector && visibleSectors.includes(sector))
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent shadow-sm font-medium'
                  : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-60'
              }`}
              style={{
                borderColor: (activeSector === sector) || (!activeSector && visibleSectors.includes(sector)) ? SECTOR_COLORS[sector] : undefined,
                color: (activeSector === sector) || (!activeSector && visibleSectors.includes(sector)) ? SECTOR_COLORS[sector] : undefined
              }}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {allSectors.map(sector => (
                <linearGradient key={sector} id={`color-${sector.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SECTOR_COLORS[sector]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={SECTOR_COLORS[sector]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} strokeOpacity={0.1} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltip type="line" />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* 
              We map over all possible sectors but only render the Area if it's in sectorsToRender.
              This keeps colors consistent.
            */}
            {allSectors.map(sector => {
              const isVisible = sectorsToRender.includes(sector);
              if (!isVisible) return null;

              return (
                <Area 
                  key={sector}
                  type="monotone" 
                  dataKey={sector} 
                  stroke={SECTOR_COLORS[sector]} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#color-${sector.replace(/\s/g, '')})`} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: SECTOR_COLORS[sector] }}
                  onClick={() => onSectorSelect(sector)}
                  style={{ cursor: 'pointer' }}
                  animationDuration={500}
                />
              );
            })}
            
            <Brush 
               dataKey="displayDate" 
               height={30} 
               stroke="#94a3b8"
               fill="transparent"
               tickFormatter={() => ''}
               className="opacity-50"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;