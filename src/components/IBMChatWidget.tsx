import { useEffect, useRef, useState } from 'react';
import { generateAuthToken } from '../services/watsonx-auth';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { LogoIcon } from './Logo';
import { fetchSupplyChainReports, formatReport, searchCrisis } from '../services/reliefweb';
import { fetchWeatherByCoordinates, fetchWeatherByCity, getLogisticsImpact } from '../services/openweathermap';
import { toast } from 'sonner';

declare global {
  interface Window {
    wxOConfiguration?: any;
    wxoLoader?: {
      init: () => void;
    };
  }
}

export function IBMChatWidget() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    "Analyze recent humanitarian supply chain disruptions",
    "Check current logistics challenges in crisis zones",
    "Review ongoing disaster impacts on medical supplies"
  ]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load real crisis data from ReliefWeb
  useEffect(() => {
    loadRealCrisisData();
  }, []);

  const loadRealCrisisData = async () => {
    setIsLoadingPrompts(true);
    try {
      const reports = await fetchSupplyChainReports(3);
      if (reports.length > 0) {
        const prompts = reports.map(report => {
          const title = report.fields.title;
          const country = report.fields.country?.[0]?.name || 'Global';
          return `${title.substring(0, 80)}${title.length > 80 ? '...' : ''} - ${country}`;
        });
        setQuickPrompts(prompts);
      }
    } catch (error) {
      console.error('Error loading crisis data:', error);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handlePromptClick = (prompt: string, index: number) => {
    const textToCopy = `Analyze this crisis: ${prompt}`;
    
    // Fallback method that works in all browsers and permission contexts
    const fallbackCopyTextToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    };
    
    // Try modern Clipboard API first, fall back to execCommand
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopiedIndex(index);
          toast.success('Prompt copied!', {
            description: 'Paste it into the chat below to start analysis'
          });
          
          setTimeout(() => {
            setCopiedIndex(null);
          }, 2000);
        })
        .catch(() => {
          // If Clipboard API fails, use fallback
          const success = fallbackCopyTextToClipboard(textToCopy);
          if (success) {
            setCopiedIndex(index);
            toast.success('Prompt copied!', {
              description: 'Paste it into the chat below to start analysis'
            });
            
            setTimeout(() => {
              setCopiedIndex(null);
            }, 2000);
          } else {
            toast.error('Failed to copy prompt', {
              description: 'Please copy manually: ' + prompt.substring(0, 50) + '...'
            });
          }
        });
    } else {
      // Use fallback directly if Clipboard API not available
      const success = fallbackCopyTextToClipboard(textToCopy);
      if (success) {
        setCopiedIndex(index);
        toast.success('Prompt copied!', {
          description: 'Paste it into the chat below to start analysis'
        });
        
        setTimeout(() => {
          setCopiedIndex(null);
        }, 2000);
      } else {
        toast.error('Failed to copy prompt', {
          description: 'Please copy manually: ' + prompt.substring(0, 50) + '...'
        });
      }
    }
  };

  // Prepare context data for IBM watsonx agents (injected in pre:send event)
  const fetchLiveDataForContext = async (query: string) => {
    try {
      // 1) Search ReliefWeb using query; fallback to recent reports
      let reports = await searchCrisis(query);
      if (!reports || reports.length === 0) {
        reports = await fetchSupplyChainReports(5);
      }

      // 2) Try to infer a location from the first report
      let weather: any | null = null;
      const first = reports?.[0];
      const primaryCountry = first?.fields?.country?.[0];
      if (primaryCountry) {
        const loc = primaryCountry?.location?.[0];
        if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
          weather = await fetchWeatherByCoordinates(loc.lat, loc.lon);
        } else if (primaryCountry?.name) {
          weather = await fetchWeatherByCity(primaryCountry.name);
        }
      }

      // 3) Format data for agent consumption
      const formattedReports = reports.slice(0, 3).map((r: any) => ({
        title: r.fields.title,
        country: r.fields.country?.map((c: any) => c.name).join(', ') || 'Global',
        date: r.fields.date?.created,
        themes: r.fields.theme?.map((t: any) => t.name).join(', ') || 'General',
        url: r.fields.url,
        disaster: r.fields.disaster?.map((d: any) => d.name).join(', ') || 'N/A'
      }));

      const weatherSummary = weather ? {
        location: weather.location,
        country: weather.country,
        temperature_celsius: weather.temperature,
        conditions: weather.conditions,
        description: weather.description,
        humidity_percent: weather.humidity,
        wind_speed_kmh: weather.windSpeed,
        visibility_km: weather.visibility,
        logistics_impact: getLogisticsImpact(weather)
      } : null;

      // 4) Create crisis summary for agent
      const crisisSummary = `Query: "${query}"\n` +
        `Recent reports (${formattedReports.length}): ${formattedReports.map(r => r.title).join('; ')}\n` +
        `Affected regions: ${formattedReports.map(r => r.country).filter((v, i, a) => a.indexOf(v) === i).join(', ')}\n` +
        `Weather conditions: ${weatherSummary ? `${weatherSummary.location} - ${weatherSummary.conditions}, ${weatherSummary.temperature_celsius}°C. ${weatherSummary.logistics_impact}` : 'No weather data available'}`;

      return {
        reports: formattedReports,
        weather: weatherSummary,
        summary: crisisSummary,
        query: query,
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error('[Chain AI] Error fetching context data:', e);
      return null;
    }
  };

  useEffect(() => {
    // Obtain auth token (IAM or unsecured fallback)
    (async () => {
      try {
        const token = await generateAuthToken();
        setAuthToken(token);
      } catch {
        setAuthToken('');
      }
    })();

    // Suppress third-party library warnings from IBM watsonx Orchestrate widget
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      // Filter out react-i18next and Three.js warnings from IBM widget
      if (
        message.includes('react-i18next') || 
        message.includes('i18next instance') ||
        message.includes('Multiple instances of Three.js')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // Filter out react-i18next errors from IBM widget
      if (message.includes('react-i18next') || message.includes('i18next instance')) {
        return;
      }
      originalError.apply(console, args);
    };

    // Configure IBM watsonx Orchestrate
    window.wxOConfiguration = {
      orchestrationID: "c139b03f7afb4bc7b617216e3046ac5b_6e4a398d-0f34-42ad-9706-1f16af156856",
      hostURL: "https://us-south.watson-orchestrate.cloud.ibm.com",
      rootElementID: "ibm-chat-root",
      deploymentPlatform: "ibmcloud",
      crn: "crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/c139b03f7afb4bc7b617216e3046ac5b:6e4a398d-0f34-42ad-9706-1f16af156856::",
      // Only include token if we have one (security enabled with JWT/IAM)
      // When security is disabled, omit token field entirely
      ...(authToken && authToken.trim() !== '' ? { token: authToken } : {}),
      chatOptions: {
        agentId: "5529ab2d-b69d-40e8-a0af-78655396c3e5",
        agentEnvironmentId: "87dcb805-67f1-4d94-a1b4-469a8f0f4dad",
      }
    };

    // Load the IBM watsonx Orchestrate script
    const script = document.createElement('script');
    script.src = `${window.wxOConfiguration.hostURL}/wxochat/wxoLoader.js?embed=true`;
    script.addEventListener('load', () => {
      if (window.wxoLoader) {
        window.wxoLoader.init();
        
        // Hook into widget events for context injection
        const checkWidget = setInterval(() => {
          const widgetInstance = (window as any).wxO?.widget;
          if (widgetInstance) {
            clearInterval(checkWidget);
            
            console.log('[Chain AI] IBM watsonx Orchestrate widget loaded - hooking pre:send event');
            
            // Inject live ReliefWeb + Weather data before each message is sent
            widgetInstance.on('pre:send', async (event: any) => {
              console.log('[Chain AI] Pre-send event - enriching with live data', event);
              try {
                const text: string | undefined =
                  event?.message?.input?.text ||
                  event?.data?.input?.text ||
                  event?.input ||
                  event?.text;
                
                if (typeof text === 'string' && text.trim().length > 0) {
                  // Fetch real-time crisis + weather data
                  const contextData = await fetchLiveDataForContext(text.trim());
                  
                  // IBM watsonx Orchestrate supports context variables
                  // Inject our external data so agents can use it
                  if (contextData && event.data) {
                    event.data.context = {
                      ...event.data.context,
                      skills: {
                        ...event.data.context?.skills,
                        'main skill': {
                          ...event.data.context?.skills?.['main skill'],
                          user_defined: {
                            ...event.data.context?.skills?.['main skill']?.user_defined,
                            reliefweb_reports: contextData.reports,
                            weather_data: contextData.weather,
                            crisis_context: contextData.summary
                          }
                        }
                      }
                    };
                    console.log('[Chain AI] ✓ Injected real-time context:', {
                      reports: contextData.reports.length,
                      weather: contextData.weather?.location || 'N/A',
                      summary: contextData.summary.substring(0, 100) + '...'
                    });
                  }
                }
              } catch (e) {
                console.warn('[Chain AI] Error enriching message with live data:', e);
                // Non-blocking - chat continues even if enrichment fails
              }
            });
          }
        }, 500); // Check every 500ms for widget instance
        
        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkWidget), 10000);
      }
    });
    document.head.appendChild(script);

    // Cleanup
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [authToken]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Chat container with glassmorphic effect */}
      <div className="backdrop-blur-xl dark:bg-slate-800/50 light:bg-white/80 border dark:border-slate-700/50 light:border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <LogoIcon variant="white" size={24} />
            </div>
            <div>
              <h3 className="text-white">Chain AI Supervisor</h3>
              <p className="text-white/90 text-sm">Powered by IBM watsonx Orchestrate</p>
            </div>
            <Sparkles className="ml-auto w-5 h-5 text-white/60 animate-pulse-glow" />
          </div>
        </div>

        {/* Quick prompts - Real ReliefWeb Data */}
        <div className="p-4 dark:bg-slate-800/30 light:bg-slate-100 backdrop-blur-sm border-t dark:border-slate-700/50 light:border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm font-medium">Real-time crisis data from ReliefWeb</p>
              <p className="text-slate-500 dark:text-slate-500 light:text-slate-500 text-xs mt-0.5">Click any prompt to copy and paste into chat below</p>
            </div>
            <button
              onClick={loadRealCrisisData}
              disabled={isLoadingPrompts}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200 transition-colors disabled:opacity-50"
              title="Refresh crisis data"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 dark:text-slate-400 light:text-slate-600 ${isLoadingPrompts ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handlePromptClick(prompt, index)}
                className="px-3 py-2 backdrop-blur-xl dark:bg-slate-700/50 light:bg-white border dark:border-slate-600/50 light:border-slate-300 rounded-lg dark:hover:bg-slate-700/70 light:hover:bg-slate-50 hover:border-indigo-500/50 transition-all duration-300 dark:text-slate-300 light:text-slate-700 text-sm cursor-pointer text-left flex items-start gap-2 group"
              >
                <span className="flex-1">{prompt}</span>
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 dark:text-slate-400 light:text-slate-500 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* IBM watsonx Orchestrate Chat Embed */}
        <div 
          id="ibm-chat-root" 
          ref={chatContainerRef}
          className="min-h-[500px] dark:bg-slate-900/50 light:bg-slate-50"
        />
      </div>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-6 backdrop-blur-xl dark:bg-slate-800/30 light:bg-slate-100/80 border dark:border-slate-700/50 light:border-slate-300 rounded-xl p-4 text-center"
      >
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">
          <strong className="text-indigo-400 dark:text-indigo-400 light:text-indigo-600">Live AI Analysis:</strong> Multi-agent system powered by IBM watsonx Orchestrate, using real humanitarian crisis data from ReliefWeb API.
        </p>
      </motion.div>
    </motion.div>
  );
}
