import React, { useEffect, useState, createContext, useContext } from 'react';
import { RAW_CSV_DATA } from './constants';
import { parseCSV } from './utils';
import { EconomicDataPoint, Language } from './types';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, Calendar, Bell, Moon, Sun, Download, Upload, Globe } from 'lucide-react';
import { TRANSLATIONS } from './translations';

// --- Language Context ---
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
}>({
  language: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS.en
});

export const useTranslation = () => useContext(LanguageContext);

function App() {
  const [data, setData] = useState<EconomicDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>('en');

  // Toggle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Initial Data Load
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const parsedData = parseCSV(RAW_CSV_DATA);
        setData(parsedData);
      } catch (error) {
        console.error("Failed to parse data", error);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Export Data
  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `economic_data_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
  };

  // Import Data
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        // Basic validation: check if array and has some required fields
        if (Array.isArray(json) && json.length > 0 && json[0].sector && json[0].amount) {
           // Need to reconstruct Date objects
           const reconstructed = json.map((item: any) => ({
             ...item,
             date: new Date(item.date)
           }));
           setData(reconstructed);
           alert("Data imported successfully!");
        } else {
          alert("Invalid data format.");
        }
      } catch (err) {
        alert("Failed to parse JSON.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EcoDash</span>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Import/Export */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={handleExport} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" title={t.export}>
                <Download size={18} />
              </button>
              <label className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer" title={t.import}>
                <Upload size={18} />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

            {/* Language Switcher */}
             <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Globe size={16} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium uppercase text-slate-700 dark:text-slate-300">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block">
                {(['en', 'ru', 'uz'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`block w-full text-left px-4 py-2 text-sm ${language === lang ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ru' ? 'Русский' : "O'zbek"}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-slate-200 dark:border-slate-600 shadow-sm"></div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t.dashboardTitle}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {t.dashboardSubtitle}
            </p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Dashboard data={data} />
          )}
        </main>
      </div>
    </LanguageContext.Provider>
  );
}

export default App;