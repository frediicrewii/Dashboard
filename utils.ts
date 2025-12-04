import { AggregatedData, EconomicDataPoint, RawCsvRow } from "./types";
import { SECTOR_TRANSLATIONS } from "./constants";

export const parseCSV = (csvText: string): EconomicDataPoint[] => {
  const lines = csvText.split('\n');
  const data: EconomicDataPoint[] = [];

  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(';');
    // Expecting: Name; Amount; Total; Date;;;;
    // Some rows have weird trailing data, but the first 4 are consistent.
    if (parts.length < 4) continue;

    const rawName = parts[0].trim();
    if (!rawName) continue; // Skip empty rows

    // Parse amount: "45222,62" -> 45222.62
    const amountStr = parts[1].replace(/\s/g, '').replace(',', '.');
    const amount = parseFloat(amountStr);

    // Parse date: "01.01.2018 г." -> Date object
    // Remove " г." and split
    const dateRaw = parts[3].replace(' г.', '').trim();
    const [day, month, year] = dateRaw.split('.').map(Number);
    
    // Validate
    if (isNaN(amount) || !day || !month || !year) continue;

    const date = new Date(year, month - 1, day);
    
    // Map Sector Name to English
    const sector = SECTOR_TRANSLATIONS[rawName] || rawName;

    data.push({
      id: `${sector}-${dateRaw}`,
      sector,
      amount,
      date,
      dateStr: dateRaw
    });
  }

  return data.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const aggregateDataByDate = (data: EconomicDataPoint[]): AggregatedData[] => {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(item => {
    const dateKey = item.date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date: dateKey,
        displayDate: item.date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      });
    }

    const group = grouped.get(dateKey)!;
    group[item.sector] = item.amount;
  });

  return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UZS', // Using Generic or UZS symbol if needed, simplified to just number format often looks cleaner
    maximumFractionDigits: 0,
  }).format(val).replace('UZS', 'sum'); // Custom styling
};

export const formatNumber = (val: number) => {
   return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(val);
}
