import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { fetchSupplyChainReports } from '../services/reliefweb';
import { WeatherWidget } from './WeatherWidget';

interface Report {
  id: string;
  title: string;
  country: string;
  countryCode?: string;
  date: string;
  url?: string;
}

export function LiveCrisisFeed() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSupplyChainReports(5);
      const formattedReports = data.map(report => ({
        id: report.id,
        title: report.fields.title,
        country: report.fields.country?.[0]?.name || 'Global',
        countryCode: report.fields.country?.[0]?.iso3,
        date: new Date(report.fields.date.created).toLocaleDateString(),
        url: report.fields.url
      }));
      setReports(formattedReports);
    } catch (error) {
      console.error('Error loading crisis feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-white/70 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white dark:text-white light:text-slate-900 font-semibold">Live Crisis Feed</h3>
              <span className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-400 text-xs font-medium">
                LIVE
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">Real-time humanitarian data with weather</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-4 bg-slate-900/30 dark:bg-slate-900/30 light:bg-slate-50 border border-slate-700/30 dark:border-slate-700/30 light:border-slate-200 rounded-xl hover:bg-slate-900/50 dark:hover:bg-slate-900/50 light:hover:bg-white hover:border-indigo-500/30 transition-all duration-300"
            >
              <h4 className="text-white dark:text-white light:text-slate-900 text-sm font-medium mb-3 line-clamp-2 group-hover:text-indigo-400 dark:group-hover:text-indigo-400 light:group-hover:text-indigo-600 transition-colors">
                {report.title}
              </h4>
              
              {/* Weather Widget for Crisis Location */}
              {report.country !== 'Global' && (
                <div className="mb-3">
                  <WeatherWidget city={report.country} compact={true} />
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500 light:text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{report.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{report.date}</span>
                </div>
                {report.url && (
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700/30 dark:border-slate-700/30 light:border-slate-200 text-center">
        <p className="text-slate-500 dark:text-slate-500 light:text-slate-400 text-xs">
          Data sourced from{' '}
          <a
            href="https://reliefweb.int"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ReliefWeb.int
          </a>
          {' '}by OCHA + Weather from{' '}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            OpenWeatherMap
          </a>
        </p>
      </div>
    </div>
  );
}
