import { useEffect, useRef, useState } from 'react';
import { WATSONX_CONFIG, WatsonXAgent } from '../services/watsonx-config';
import { generateAuthToken } from '../services/watsonx-auth';

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
  const scriptLoadedRef = useRef(false);
  const chatInstanceRef = useRef<any>(null);

  // Get an auth token (IAM if possible, unsecured fallback in dev)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('[Chain AI] Requesting authentication token...');
        const token = await generateAuthToken();
        if (!cancelled) {
          setAuthToken(token);
        }
      } catch (e: any) {
        console.warn('[Chain AI] Failed to obtain auth token', e);
        if (!cancelled) {
          // Provide clear guidance rather than hanging on "Connecting..."
          const env: any = (import.meta as any)?.env ?? {};
          const msg = env.VITE_WXO_JWT
            ? 'Provided JWT appears invalid or expired. Please refresh it and reload.'
            : 'Authentication not configured. Either set VITE_WXO_JWT to a valid Orchestrate JWT, or disable security with VITE_WXO_SECURITY_DISABLED=true (dev only). See wxO-embed-chat-security-tool.sh.';
          setError(msg);
          setIsLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Wait for auth token before loading chat
    if (!authToken) {
      return;
    }

    // Don't reload if script is already loaded
    if (scriptLoadedRef.current) {
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
              chatInstanceRef.current = instance;
              
              // Subscribe to error events
              instance.on('error', (event: any) => {
                console.error('[Chain AI] Chat error event:', event);
                // Don't suppress errors - we need to see what's blocking the connection
                const errorMsg = event?.error?.message || event?.message || 'Unknown error';
                setError(`Chat initialization failed: ${errorMsg}`);
                setIsLoading(false);
              });

              // Subscribe to chat ready event
              instance.on('chat:ready', (event: any) => {
                console.log('[Chain AI] Chat ready', event);
                setIsLoading(false);
                onChatReady?.();
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
            
            // Set timeout to detect if chat never becomes ready
            setTimeout(() => {
              if (isLoading) {
                console.error('[Chain AI] Chat failed to become ready within 30 seconds');
                setError('Chat connection timeout. The agent may not be configured for anonymous access or the environment may not be published. Check browser console for details.');
                setIsLoading(false);
              }
            }, 30000);
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
  }, [agent.agentId, agent.agentEnvironmentId, authToken, onLoad, onChatReady]);

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
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
