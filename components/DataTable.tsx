import React, { useState, useEffect } from 'react';
import { EconomicDataPoint } from '../types';
import { formatNumber } from '../utils';
import { Search } from 'lucide-react';
import { useTranslation } from '../App';

interface Props {
  data: EconomicDataPoint[];
  activeSector: string | null;
}

const DataTable: React.FC<Props> = ({ data, activeSector }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reset search when active filter changes, or maybe combine them? 
  // Let's combine: if activeSector is set, we essentially implicitly search for it.
  
  const sortedData = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());

  const filteredData = sortedData.filter(item => {
    const matchesSearch = item.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.dateStr.includes(searchTerm);
    const matchesFilter = activeSector ? item.sector === activeSector : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-sm transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.recentData}</h3>
          {activeSector && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {activeSector}
            </span>
          )}
        </div>
        
        <div className="relative w-full sm:w-auto">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-colors placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
        </div>
      </div>
      
      <div className="overflow-auto flex-grow custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.date}</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.sector}</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t.amount}</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredData.slice(0, 100).map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{row.dateStr}</td>
                <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{row.sector}</td>
                <td className="p-4 text-sm text-slate-900 dark:text-white font-bold text-right font-mono">
                  {formatNumber(row.amount)}
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    {t.recorded}
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
               <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  {t.noRecords}
                </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
        {t.showingTop} {Math.min(filteredData.length, 100)}
      </div>
    </div>
  );
};

export default DataTable;