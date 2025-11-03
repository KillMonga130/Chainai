import './services/error-suppressor'; // MUST BE FIRST - suppress known errors
import './services/error-suppressor'; // MUST BE FIRST - suppress known errors
import './services/i18n'; // Initialize i18next mock
import { useEffect, useRef } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { Navigation } from './components/Navigation';
import { FeatureCard } from './components/FeatureCard';
import { AgentCard } from './components/AgentCard';
import { MetricCard } from './components/MetricCard';
import { ChainAISupervisor } from './components/ChainAISupervisor';
import { LiveCrisisFeed } from './components/LiveCrisisFeed';
import { ChainAILogo } from './components/Logo';
import { Toaster } from './components/ui/sonner';
import { motion } from 'motion/react';
import { 
  Zap, 
  Target, 
  Users, 
  Shield, 
  BarChart3, 
  Globe,
  Network,
  Search,
  Lightbulb,
  CheckCircle,
  Github,
  FileText,
  Mail,
  Lock,
  ArrowRight,
  Cpu,
  Brain,
  Activity
} from 'lucide-react';

export default function App() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    // Authentication status console message
    const ENV: any = (import.meta as any)?.env ?? {};
    const isSecurityDisabled = `${ENV.VITE_WXO_SECURITY_DISABLED}` === 'true';
    const hasJWT = !!ENV.VITE_WXO_JWT;
    const useIAM = `${ENV.VITE_WXO_USE_IAM}` === 'true';

    console.log(
      '%c🔐 Chain AI Security System',
      'color: #4f46e5; font-size: 16px; font-weight: bold;'
    );
    if (hasJWT) {
      console.log('%c✅ Auth: Using JWT from environment', 'color: #10b981; font-size: 12px;');
    } else if (isSecurityDisabled) {
      console.log('%c⚠️ Security DISABLED mode active (unsecured token)', 'color: #f59e0b; font-size: 12px;');
      console.log('%c⚠️ IMPORTANT: Run wxO-embed-chat-security-tool.sh to disable security on your Orchestrate instance!', 'color: #f59e0b; font-size: 12px; font-weight: bold;');
      console.log('%c   Until then, you will get 401 errors from the API.', 'color: #f59e0b; font-size: 12px;');
      console.log('%c   See DISABLE_SECURITY_STEPS.md for instructions.', 'color: #6366f1; font-size: 12px;');
    } else if (useIAM) {
      console.log('%cℹ️ Auth: Attempting IBM Cloud IAM (may not be accepted by Orchestrate embed)', 'color: #6366f1; font-size: 12px;');
    } else {
      console.log('%c⚠️ Security likely enabled on instance: provide VITE_WXO_JWT or disable with VITE_WXO_SECURITY_DISABLED=true', 'color: #f59e0b; font-size: 12px;');
    }
    console.log(
      '%cℹ️ To monitor connection status:',
      'color: #6366f1; font-size: 12px;'
    );
    console.log('   1. Click the Settings icon (⚙️) in the navigation');
    console.log('   2. View Connection Status and Configuration Validator');
  }, []);

  return (
    <ThemeProvider>
      <Toaster position="top-right" theme="dark" richColors />
      <div className="min-h-screen w-full overflow-y-auto dark:bg-slate-950 light:bg-gradient-to-b light:from-slate-50 light:to-white relative">
        {/* Animated background patterns */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 dark:bg-indigo-500/20 light:bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 dark:bg-purple-500/20 light:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 dark:bg-teal-500/20 light:bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] light:bg-[linear-gradient(rgba(79,70,229,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="relative z-10 pt-20 w-full overflow-y-auto">
        {/* Hero Section */}
        <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
                >
                  <Zap className="w-4 h-4" />
                  <span>Powered by IBM watsonx Orchestrate</span>
                </motion.div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white dark:text-white light:text-slate-900 mb-6 leading-tight">
                  Emergency{' '}
                  <span className="gradient-text">Supply Chain</span>{' '}
                  Response
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-400 dark:text-slate-400 light:text-slate-600 mb-8 leading-relaxed">
                  Save lives by making critical supply chain decisions{' '}
                  <span className="text-teal-400 font-semibold">80% faster</span>.
                  Chain AI analyzes humanitarian crises in{' '}
                  <span className="text-indigo-400 font-semibold">20 minutes</span>{' '}
                  instead of 8-13 hours using multi-agent AI.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById('try-now')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Try Supervisor AI</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 rounded-full border-2 border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold text-lg hover:border-indigo-500 hover:text-white dark:hover:text-white light:hover:text-indigo-600 hover:bg-indigo-500/10 transition-all duration-300"
                  >
                    Learn More
                  </motion.button>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 grid grid-cols-3 gap-8"
                >
                  <div>
                    <div className="text-3xl font-bold gradient-text">20min</div>
                    <div className="text-sm text-slate-500 dark:text-slate-500 light:text-slate-400">Analysis Time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold gradient-text">80%</div>
                    <div className="text-sm text-slate-500 dark:text-slate-500 light:text-slate-400">Faster</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold gradient-text">5</div>
                    <div className="text-sm text-slate-500 dark:text-slate-500 light:text-slate-400">AI Agents</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Main card */}
                <div className="relative backdrop-blur-xl dark:bg-slate-800/50 light:bg-white/70 border dark:border-slate-700/50 light:border-slate-200 rounded-3xl p-8 shadow-2xl">
                  {/* Logo */}
                  <div className="flex justify-center mb-8">
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                      <ChainAILogo size="lg" variant="white" animated={true} />
                    </div>
                  </div>

                  {/* Agent indicators */}
                  <div className="space-y-4">
                    {[
                      { icon: Cpu, label: 'Supervisor Agent', status: 'Coordinating' },
                      { icon: Search, label: 'Disruption Analyzer', status: 'Scanning' },
                      { icon: Brain, label: 'Root Cause Investigator', status: 'Analyzing' },
                      { icon: Lightbulb, label: 'Mitigation Recommender', status: 'Optimizing' },
                      { icon: Activity, label: 'Communicator', status: 'Ready' }
                    ].map((agent, index) => (
                      <motion.div
                        key={agent.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 dark:bg-slate-900/50 light:bg-slate-50 rounded-xl border dark:border-slate-700/30 light:border-slate-200"
                      >
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <agent.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white dark:text-white light:text-slate-900 font-medium text-sm">{agent.label}</div>
                          <div className="text-slate-500 dark:text-slate-500 light:text-slate-400 text-xs">{agent.status}</div>
                        </div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg"
                >
                  <Network className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
                  Features
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-6">
                  Why Chain AI
                </h2>
                <p className="text-xl text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                  Revolutionary AI-powered supply chain analysis that saves lives and reduces response time by 80%
                </p>
              </motion.div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Zap}
                title="80% Faster Response"
                description="Reduce analysis time from 8-13 hours to just 20 minutes with our AI-powered multi-agent system"
                index={0}
              />
              <FeatureCard
                icon={Target}
                title="Multi-Agent Reasoning"
                description="5 specialized AI agents work together using ReAct reasoning framework for comprehensive analysis"
                index={1}
              />
              <FeatureCard
                icon={Users}
                title="3 Audience Messages"
                description="Automatically generates targeted communications for logistics teams, NGO leadership, and clinic directors"
                index={2}
              />
              <FeatureCard
                icon={Shield}
                title="Human Approval Gate"
                description="All AI recommendations require human verification before implementation, ensuring safety and accountability"
                index={3}
              />
              <FeatureCard
                icon={BarChart3}
                title="Real-Time Data"
                description="Integrates live data from transportation, weather, inventory, and news sources for accurate analysis"
                index={4}
              />
              <FeatureCard
                icon={Globe}
                title="Global Impact"
                description="Designed for humanitarian operations worldwide, saving 2,500-5,000 lives annually with faster decisions"
                index={5}
              />
            </div>
          </div>
        </section>

        {/* Agents Section */}
        <section id="agents" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                  AI Agents
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Our Multi-Agent System
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed">
                  Meet the specialized agents that power Chain AI's intelligent supply chain analysis
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AgentCard
                number={1}
                title="Supervisor Agent"
                description="Orchestrates all agents using ReAct reasoning framework. Decides which agents to activate and coordinates the analysis workflow."
                status="LIVE"
                index={0}
              />
              <AgentCard
                number={2}
                title="Disruption Analyzer"
                description="Analyzes supply chain disruptions by examining transportation, weather, inventory, and news data to identify critical issues."
                status="LIVE"
                index={1}
              />
              <AgentCard
                number={3}
                title="Root Cause Investigator"
                description="Investigates underlying causes of disruptions, conducting deep analysis to understand why problems occurred."
                status="LIVE"
                index={2}
              />
              <AgentCard
                number={4}
                title="Mitigation Recommender"
                description="Generates actionable mitigation strategies based on analysis, providing ranked options with cost and timeline estimates."
                status="LIVE"
                index={3}
              />
              <AgentCard
                number={5}
                title="Communicator Agent"
                description="Creates targeted messages for 3 audiences: logistics teams, NGO leadership, and clinic directors with role-specific KPIs."
                status="LIVE"
                index={4}
              />
              
              {/* System Features Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="backdrop-blur-xl bg-gradient-to-br from-teal-500/10 to-teal-600/10 border border-teal-500/30 rounded-xl p-6 flex flex-col justify-center"
              >
                <CheckCircle className="w-12 h-12 text-teal-400 mb-4" />
                <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-4">System Features</h3>
                <ul className="text-slate-300 dark:text-slate-300 light:text-slate-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2" />
                    <span>Human approval gate before action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2" />
                    <span>Real-time data integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2" />
                    <span>IBM watsonx Orchestrate powered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2" />
                    <span>15-20 minute analysis time</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Impact Metrics Section */}
        <section id="impact" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 dark:from-indigo-900/30 dark:to-purple-900/30 light:from-indigo-50 light:to-purple-50 border border-slate-700/50 dark:border-slate-700/50 light:border-indigo-200 rounded-3xl p-12 shadow-2xl">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-block px-4 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
                    Impact
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-6">
                    Global Impact
                  </h2>
                  <p className="text-xl text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
                    Real-world results from faster, smarter supply chain decisions
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <MetricCard
                  value="2.5K-5K"
                  label="Lives Saved"
                  subtitle="Annually"
                  index={0}
                />
                <MetricCard
                  value="80%"
                  label="Faster"
                  subtitle="Response Time"
                  index={1}
                />
                <MetricCard
                  value="$6M+"
                  label="Cost Savings"
                  subtitle="Per Year"
                  index={2}
                />
                <MetricCard
                  value="5"
                  label="AI Agents"
                  subtitle="Working Together"
                  index={3}
                />
              </div>

              {/* Humanitarian Impact Story */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl dark:bg-slate-800/30 light:bg-white/70 rounded-2xl p-8 border dark:border-slate-700/30 light:border-slate-200"
              >
                <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-4 text-xl">Humanitarian Impact</h3>
                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed mb-4">
                  In emergency situations, every minute counts. When vaccines are delayed or medical 
                  supplies are stuck in transit, lives are at stake. Chain AI's 80% reduction in 
                  analysis time means faster decisions, faster deliveries, and lives saved.
                </p>
                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed">
                  Built for NGOs and humanitarian organizations responding to crises worldwide, 
                  Chain AI turns complex supply chain data into actionable insights in minutes, 
                  not hours.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Chain AI Supervisor Section */}
        <section id="try-now" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            {/* Live Crisis Feed */}
            <div className="mb-16">
              <LiveCrisisFeed />
            </div>
            <div className="max-w-5xl mx-auto text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
                  Try It Now
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-6">
                  Chain AI Supervisor
                </h2>
                <p className="text-xl text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                  Interact with our multi-agent orchestration system. The Supervisor coordinates 5 specialized AI agents to analyze supply chain disruptions in real-time.
                </p>
              </motion.div>
            </div>

            <ChainAISupervisor />
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl dark:bg-slate-800/30 light:bg-white/70 border dark:border-slate-700/50 light:border-slate-200 rounded-3xl p-12 shadow-2xl">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-6">
                  Powered by{' '}
                  <span className="gradient-text">IBM watsonx Orchestrate</span>
                </h2>
                <p className="text-xl text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                  Enterprise-grade AI orchestration for mission-critical humanitarian operations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="backdrop-blur-xl dark:bg-slate-800/50 light:bg-white border dark:border-slate-700/50 light:border-slate-200 rounded-xl p-6 text-center hover:border-indigo-500/30 transition-all duration-300"
                >
                  <Network className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-2">Multi-Agent System</h3>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">
                    5 specialized agents coordinated by supervisor using ReAct reasoning framework
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="backdrop-blur-xl dark:bg-slate-800/50 light:bg-white border dark:border-slate-700/50 light:border-slate-200 rounded-xl p-6 text-center hover:border-purple-500/30 transition-all duration-300"
                >
                  <Search className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-2">Real-Time Analysis</h3>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">
                    Integrates live data from transportation, weather, inventory, and news sources
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="backdrop-blur-xl dark:bg-slate-800/50 light:bg-white border dark:border-slate-700/50 light:border-slate-200 rounded-xl p-6 text-center hover:border-teal-500/30 transition-all duration-300"
                >
                  <Lightbulb className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-2">Intelligent Insights</h3>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">
                    Actionable recommendations with cost estimates, timelines, and risk assessments
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-6 border-t dark:border-slate-800/50 light:border-slate-200 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl dark:bg-slate-800/20 light:bg-white/60 rounded-2xl p-8">
              {/* Logo and tagline */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <ChainAILogo size="md" animated={false} />
                </div>
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mb-2">Emergency Supply Chain Response</p>
                <p className="text-slate-500 dark:text-slate-500 light:text-slate-500">Powered by IBM watsonx Orchestrate + ReliefWeb</p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <a href="#" className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors duration-300">
                  <FileText className="w-4 h-4" />
                  Documentation
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors duration-300">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors duration-300">
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors duration-300">
                  <Lock className="w-4 h-4" />
                  Privacy
                </a>
              </div>

              {/* Bottom text */}
              <div className="text-center space-y-2">
                <p className="text-slate-500 dark:text-slate-500 light:text-slate-400 text-sm">
                  Built for Call for Code Global Challenge 2025
                </p>
                <p className="text-slate-600 dark:text-slate-600 light:text-slate-500 text-sm">
                  © 2025 Chain AI. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
