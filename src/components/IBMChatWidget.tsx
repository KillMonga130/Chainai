import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { LogoIcon } from './Logo';
import { fetchSupplyChainReports, formatReport } from '../services/reliefweb';

declare global {
  interface Window {
    wxOConfiguration?: {
      orchestrationID: string;
      hostURL: string;
      rootElementID: string;
      deploymentPlatform: string;
      crn: string;
      chatOptions: {
        agentId: string;
        agentEnvironmentId: string;
      };
    };
    wxoLoader?: {
      init: () => void;
    };
  }
}

export function IBMChatWidget() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    "Analyze recent humanitarian supply chain disruptions",
    "Check current logistics challenges in crisis zones",
    "Review ongoing disaster impacts on medical supplies"
  ]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

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

  useEffect(() => {
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
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Chat container with glassmorphic effect */}
      <div className="backdrop-blur-xl bg-slate-800/50 dark:bg-slate-800/50 light:bg-white/80 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <LogoIcon variant="white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Chain AI Supervisor</h3>
              <p className="text-white/80 text-sm">Powered by IBM watsonx Orchestrate</p>
            </div>
            <Sparkles className="ml-auto w-5 h-5 text-white/60 animate-pulse-glow" />
          </div>
        </div>

        {/* Quick prompts - Real ReliefWeb Data */}
        <div className="p-4 bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-100 backdrop-blur-sm border-t border-slate-700/50 dark:border-slate-700/50 light:border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">Real-time crisis data from ReliefWeb:</p>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-2 backdrop-blur-xl bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600/50 dark:border-slate-600/50 light:border-slate-300 rounded-lg hover:bg-slate-700/70 dark:hover:bg-slate-700/70 light:hover:bg-slate-50 hover:border-indigo-500/50 transition-all duration-300 text-slate-300 dark:text-slate-300 light:text-slate-700 text-sm cursor-pointer"
              >
                {prompt}
              </motion.div>
            ))}
          </div>
        </div>

        {/* IBM watsonx Orchestrate Chat Embed */}
        <div 
          id="ibm-chat-root" 
          ref={chatContainerRef}
          className="min-h-[500px] bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50"
        />
      </div>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-6 backdrop-blur-xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-100/80 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 rounded-xl p-4 text-center"
      >
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">
          <strong className="text-indigo-400 dark:text-indigo-400 light:text-indigo-600">Live AI Analysis:</strong> Multi-agent system powered by IBM watsonx Orchestrate, using real humanitarian crisis data from ReliefWeb API.
        </p>
      </motion.div>
    </motion.div>
  );
}
