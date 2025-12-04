export type Language = 'en' | 'ru' | 'uz';

export interface RawCsvRow {
  name: string;
  amount: number;
  totalAmount: number;
  dateStr: string;
}

export interface EconomicDataPoint {
  id: string;
  sector: string;
  amount: number;
  date: Date;
  dateStr: string; // ISO or display format
}

export interface AggregatedData {
  date: string; // ISO date string for sorting
  displayDate: string;
  [sector: string]: number | string; // Dynamic keys for Recharts
}

export interface SectorStat {
  sector: string;
  currentAmount: number;
  growth: number;
  color: string;
}

export enum ChartPeriod {
  ALL = 'ALL',
  YEAR_1 = '1Y',
  YEAR_3 = '3Y',
  YEAR_5 = '5Y'
}