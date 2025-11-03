import { useEffect, useRef, useState } from 'react';
import { WATSONX_CONFIG, WatsonXAgent } from '../services/watsonx-config';
import { generateAuthToken } from '../services/watsonx-auth';
import { fetchSupplyChainReports, searchCrisis, formatReport } from '../services/reliefweb';
import { fetchWeatherByCoordinates, fetchWeatherByCity, getLogisticsImpact, getWeatherIconUrl } from '../services/openweathermap';

interface WatsonXChatProps {
  agent: WatsonXAgent;
  onLoad?: () => void;
  onChatReady?: () => void;
  className?: string;
}

declare global {
  interface Window {
    wxOConfiguration?: any;
    wxoLoader?: {
      init: () => void;
    };
  }
}

export function WatsonXChat({ agent, onLoad, onChatReady, className = '' }: WatsonXChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false); // Track if auth initialization is complete
  const env = (import.meta as any)?.env ?? {};
  const securityDisabled = (env.VITE_WXO_SECURITY_DISABLED === 'true');
  const useJwtServer = (env.VITE_WXO_USE_JWT_SERVER === 'true');
  const scriptLoadedRef = useRef(false);
  const chatInstanceRef = useRef<any>(null);
  // Live data pulled alongside chat (ReliefWeb + Weather)
  const [liveReports, setLiveReports] = useState<any[]>([]);
  const [liveWeather, setLiveWeather] = useState<any | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  function getAnonymousUserId() {
    try {
      const k = 'wx_user_id';
      let v = sessionStorage.getItem(k);
      if (!v) {
        v = `anon-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(k, v);
      }
      return v;
    } catch {
      return `anon-${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  async function tryFetchJwtToken(): Promise<string | null> {
    try {
      const userId = getAnonymousUserId();
      const resp = await fetch(`http://localhost:3003/createJWT?user_id=${encodeURIComponent(userId)}`, {
        method: 'GET',
        mode: 'cors',
      });
      if (!resp.ok) return null;
      const token = (await resp.text()).trim();
      if (!token) return null;
      console.log('[Chain AI] JWT token acquired from local server');
      return token;
    } catch (e) {
      console.warn('[Chain AI] JWT server not available, will fallback to IAM if configured', e);
      return null;
    }
  }

  // Get an auth token (JWT server preferred; fallback to IAM if available). Skip if security is disabled.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (securityDisabled) {
          console.log('[Chain AI] Security disabled – proceeding without token');
          if (!cancelled) {
            setAuthToken('');
            setAuthReady(true); // Mark auth as ready
          }
          return;
        }
        console.log('[Chain AI] Requesting authentication token...');
        // Prefer local JWT server if enabled
        let token = null;
        if (useJwtServer) {
          token = await tryFetchJwtToken();
          if (!token) {
            console.warn('[Chain AI] JWT server configured but unavailable. Make sure it\'s running on http://localhost:3003');
          }
        }
        // Fallback to IAM if JWT not available
        if (!token) {
          token = await generateAuthToken();
        }
        if (!cancelled) {
          setAuthToken(token);
          setAuthReady(true); // Mark auth as ready
        }
      } catch (e: any) {
        console.warn('[Chain AI] Failed to obtain auth token', e);
        if (!cancelled) {
          // Provide clear guidance rather than hanging on "Connecting..."
          const msg = env.VITE_WXO_JWT
            ? 'Provided JWT appears invalid or expired. Please refresh it and reload.'
            : useJwtServer
            ? 'JWT server not running. Start it with: npm run start:jwt'
            : 'Authentication not configured. Start the local JWT server (npm run start:jwt) after placing keys in ./wxo_security_config, or configure IAM via VITE_WXO_USE_IAM + VITE_WATSONX_API_KEY. See SECURITY_NOTICE.md.';
          setError(msg);
          setIsLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [securityDisabled, useJwtServer]);

  useEffect(() => {
    // Wait for auth initialization to complete
    if (!authReady) {
      console.log('[Chain AI] Waiting for auth initialization...');
      return;
    }

    console.log('[Chain AI] Auth ready! Security disabled:', securityDisabled, 'Auth token present:', !!authToken);

    // Don't reload if script is already loaded
    if (scriptLoadedRef.current) {
      console.log('[Chain AI] Script already loaded, skipping reload');
      return;
    }

    const loadWatsonXChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Chain AI] Configuring watsonx Orchestrate...');

        // Configure watsonx Orchestrate with authentication
        const config: any = {
          orchestrationID: WATSONX_CONFIG.orchestrationID,
          hostURL: WATSONX_CONFIG.hostURL,
          rootElementID: containerRef.current?.id || 'watsonx-chat-root',
          showLauncher: false,
          deploymentPlatform: WATSONX_CONFIG.deploymentPlatform,
          crn: WATSONX_CONFIG.crn,
          // Only include token if we have one (security enabled with JWT/IAM)
          // When security is disabled, omit token field entirely
          ...(authToken && authToken.trim() !== '' ? { token: authToken } : {}),
          chatOptions: {
            agentId: agent.agentId,
            agentEnvironmentId: agent.agentEnvironmentId,
            onLoad: (instance: any) => {
              console.log('[Chain AI] watsonx Orchestrate chat loaded', instance);
              console.log('[Chain AI] Security disabled:', securityDisabled);
              console.log('[Chain AI] Auth token present:', !!authToken);
              console.log('[Chain AI] Agent ID:', agent.agentId);
              console.log('[Chain AI] Environment ID:', agent.agentEnvironmentId);
              chatInstanceRef.current = instance;
              
              // Subscribe to ALL events for debugging
              instance.on('*', (event: any) => {
                console.log('[Chain AI] Event:', event);
              });

              // Subscribe to error events
              instance.on('error', (event: any) => {
                console.error('[Chain AI] Chat error event:', event);
                console.error('[Chain AI] Full error details:', JSON.stringify(event, null, 2));
                // Don't suppress errors - we need to see what's blocking the connection
                const errorMsg = event?.error?.message || event?.message || event?.data?.message || 'Unknown error';
                const errorDetails = event?.error?.details || event?.details || '';
                setError(`Chat initialization failed: ${errorMsg}${errorDetails ? '\n' + errorDetails : ''}`);
                setIsLoading(false);
              });

              // Subscribe to chat ready event
              instance.on('chat:ready', (event: any) => {
                console.log('[Chain AI] ✅ Chat ready', event);
                setIsLoading(false);
                onChatReady?.();
              });

              // Token refresh on demand
              instance.on('authTokenNeeded', async () => {
                try {
                  console.log('[Chain AI] authTokenNeeded received - refreshing token');
                  const newToken = (await tryFetchJwtToken()) || (await generateAuthToken());
                  if (newToken) {
                    instance.setToken(newToken);
                    setAuthToken(newToken);
                  } else {
                    console.warn('[Chain AI] Unable to refresh token');
                  }
                } catch (e) {
                  console.warn('[Chain AI] Token refresh failed', e);
                }
              });

              // Subscribe to message events for custom styling
              instance.on('pre:receive', (event: any) => {
                console.log('[Chain AI] Pre-receive event', event);
                
                // Add feedback options to messages
                const lastItem = event?.message?.content?.[event.message?.content.length - 1];
                if (lastItem) {
                  lastItem.message_options = {
                    feedback: {
                      is_on: true,
                      show_positive_details: false,
                      show_negative_details: true,
                      positive_options: {
                        categories: ['Helpful', 'Accurate', 'Fast'],
                        disclaimer: 'Your feedback helps improve Chain AI.',
                      },
                      negative_options: {
                        categories: ['Inaccurate', 'Incomplete', 'Too slow', 'Irrelevant', 'Other'],
                        disclaimer: 'Your feedback helps improve Chain AI.',
                      },
                    },
                  };
                }
              });

              instance.on('receive', (event: any) => {
                console.log('[Chain AI] Message received', event);
              });

              instance.on('pre:send', async (event: any) => {
                console.log('[Chain AI] Pre-send event - enriching with live data', event);
                // Best-effort data enrichment from ReliefWeb + OpenWeather
                try {
                  const text: string | undefined =
                    event?.message?.input?.text ||
                    event?.data?.input?.text ||
                    event?.input ||
                    event?.text;
                  
                  if (typeof text === 'string' && text.trim().length > 0) {
                    // Fetch data and inject into context variables
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
                      console.log('[Chain AI] Injected context variables:', event.data.context);
                    }
                    
                    // Also update UI panel (non-blocking)
                    fetchLiveData(text.trim());
                  }
                } catch (e) {
                  console.warn('[Chain AI] Error enriching message with live data:', e);
                  // Non-blocking - chat continues even if enrichment fails
                }
              });

              instance.on('send', (event: any) => {
                console.log('[Chain AI] Message sent', event);
              });

              instance.on('feedback', (event: any) => {
                console.log('[Chain AI] Feedback received', event);
              });

              onLoad?.();
            },
          },
          layout: {
            form: 'custom',
            showOrchestrateHeader: false,
            customElement: containerRef.current,
          },
          style: {
            headerColor: '#4f46e5',
            userMessageBackgroundColor: '#6366f1',
            primaryColor: '#0f62fe',
            showBackgroundGradient: false,
          },
        };

        // No authentication required - security disabled

        window.wxOConfiguration = config;

        // Load the watsonx Orchestrate script
        const script = document.createElement('script');
        script.src = `${WATSONX_CONFIG.hostURL}/wxochat/wxoLoader.js?embed=true`;
        script.async = true;
        
        script.addEventListener('load', () => {
          console.log('[Chain AI] watsonx Orchestrate loader script loaded');
          if (window.wxoLoader) {
            window.wxoLoader.init();
            scriptLoadedRef.current = true;
          } else {
            setError('Failed to initialize watsonx Orchestrate');
          }
        });

        script.addEventListener('error', () => {
          console.error('[Chain AI] Failed to load watsonx Orchestrate script');
          setError('Failed to load watsonx Orchestrate. Please check your connection.');
          setIsLoading(false);
        });

        document.head.appendChild(script);

        // Cleanup function
        return () => {
          // Note: We don't remove the script to prevent reload issues
          // The script should only be loaded once per session
        };
      } catch (err) {
        console.error('[Chain AI] Error loading watsonx chat:', err);
        setError('Failed to initialize chat. Please try again.');
        setIsLoading(false);
      }
    };

    loadWatsonXChat();
  }, [agent.agentId, agent.agentEnvironmentId, authReady, authToken, onLoad, onChatReady]);

  // Prepare context data for IBM watsonx agents (used in pre:send event)
  async function fetchLiveDataForContext(query: string) {
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
  }

  // Fetch ReliefWeb + Weather based on a user query (for UI panel display)
  async function fetchLiveData(query: string) {
    setLiveLoading(true);
    setLiveError(null);
    try {
      // 1) Search ReliefWeb using query; fallback to recent reports
      let reports = await searchCrisis(query);
      if (!reports || reports.length === 0) {
        reports = await fetchSupplyChainReports(5);
      }
      setLiveReports(reports.slice(0, 3));

      // 2) Try to infer a location from the first report
      let weather: any | null = null;
      const first = reports?.[0];
      const primaryCountry = first?.fields?.country?.[0];
      if (primaryCountry) {
        // Prefer coordinates if present
        const loc = primaryCountry?.location?.[0];
        if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
          weather = await fetchWeatherByCoordinates(loc.lat, loc.lon);
        } else if (primaryCountry?.name) {
          weather = await fetchWeatherByCity(primaryCountry.name);
        }
      }
      setLiveWeather(weather);
    } catch (e: any) {
      setLiveError('Failed to pull external crisis and weather data');
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <div className={`relative w-full h-full ${className}`}>


      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm dark:bg-slate-900/50 light:bg-white/50 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="dark:text-slate-300 light:text-slate-700">
              Connecting to {agent.name}...
            </p>
            <p className="text-sm dark:text-slate-400 light:text-slate-500 mt-2">
              Powered by IBM watsonx Orchestrate
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm dark:bg-red-900/20 light:bg-red-50 z-10">
          <div className="text-center max-w-md p-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="dark:text-white light:text-slate-900 mb-2">Connection Error</h3>
            <p className="dark:text-slate-300 light:text-slate-700 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div 
        ref={containerRef} 
        id="watsonx-chat-root"
        className="w-full h-full min-h-[500px]"
      />

      {/* Live Data Panel (ReliefWeb + Weather) */}
      <div className="mt-4 rounded-xl border dark:border-slate-700/50 light:border-slate-300 backdrop-blur-xl dark:bg-slate-900/40 light:bg-white/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold dark:text-white light:text-slate-900">External Situation Feed</h3>
          <button
            onClick={() => fetchLiveData('supply chain disruption')}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Refresh Data
          </button>
        </div>

        {liveLoading && (
          <p className="text-sm dark:text-slate-400 light:text-slate-600">Pulling latest crisis and weather data…</p>
        )}
        {liveError && (
          <p className="text-sm text-red-400">{liveError}</p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* ReliefWeb reports */}
          <div>
            <h4 className="text-xs uppercase tracking-wide dark:text-slate-400 light:text-slate-600 mb-2">ReliefWeb (Top reports)</h4>
            {liveReports.length === 0 ? (
              <p className="text-sm dark:text-slate-400 light:text-slate-600">No reports yet. Send a message to the agent to fetch context-aware data.</p>
            ) : (
              <ul className="space-y-2">
                {liveReports.map((r, idx) => (
                  <li key={idx} className="p-3 rounded-md dark:bg-slate-800/50 light:bg-slate-100">
                    <div className="text-sm dark:text-white light:text-slate-900 font-medium mb-1">{r.fields.title}</div>
                    <div className="text-xs dark:text-slate-400 light:text-slate-600">
                      {(r.fields.country?.map((c: any) => c.name).join(', ')) || 'Global'} • {new Date(r.fields.date?.created).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Weather snapshot */}
          <div>
            <h4 className="text-xs uppercase tracking-wide dark:text-slate-400 light:text-slate-600 mb-2">Weather (Logistics Impact)</h4>
            {!liveWeather ? (
              <p className="text-sm dark:text-slate-400 light:text-slate-600">Weather will appear after we identify a location from recent reports.</p>
            ) : (
              <div className="p-3 rounded-md dark:bg-slate-800/50 light:bg-slate-100 flex items-center gap-3">
                {liveWeather.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getWeatherIconUrl(liveWeather.icon)} alt={liveWeather.description} className="w-10 h-10" />
                )}
                <div className="flex-1">
                  <div className="text-sm dark:text-white light:text-slate-900 font-medium">
                    {liveWeather.location} {liveWeather.country ? `(${liveWeather.country})` : ''}
                  </div>
                  <div className="text-xs dark:text-slate-300 light:text-slate-700">
                    {liveWeather.temperature}°C • {liveWeather.description}
                  </div>
                  <div className="text-xs dark:text-slate-400 light:text-slate-600 mt-1">
                    {getLogisticsImpact(liveWeather)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
