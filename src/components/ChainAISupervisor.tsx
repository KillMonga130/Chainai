import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Search, 
  Brain, 
  Lightbulb, 
  Activity, 
  Send, 
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { LogoIcon } from './Logo';
import { fetchSupplyChainReports } from '../services/reliefweb';
import { toast } from 'sonner';
import { AGENTS, WatsonXAgent } from '../services/watsonx-config';
import { WatsonXChat } from './WatsonXChat';
import { notifyApprovalRequired, notifyCriticalDisruption } from '../services/whatsapp-notification';

interface Agent {
  id: string;
  name: string;
  icon: typeof Cpu;
  status: 'idle' | 'active' | 'complete' | 'error';
  progress: number;
  message: string;
  color: string;
}

interface Message {
  id: string;
  role: 'user' | 'supervisor' | 'system';
  content: string;
  timestamp: Date;
  agentUpdates?: {
    agent: string;
    status: string;
  }[];
}

interface ChainAISupervisorProps {
  agent?: WatsonXAgent;
}

export function ChainAISupervisor({ agent: propAgent }: ChainAISupervisorProps = {}) {
  const messageIdCounter = useRef(0);
  const [selectedAgent, setSelectedAgent] = useState<WatsonXAgent>(propAgent || AGENTS[0]);
  
  // Update selected agent when prop changes
  useEffect(() => {
    if (propAgent) {
      setSelectedAgent(propAgent);
    }
  }, [propAgent]);
  const [chatMode, setChatMode] = useState<'live' | 'demo'>('live');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      role: 'system',
      content: 'Chain AI Supervisor initialized. Ready to analyze supply chain disruptions using multi-agent orchestration.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [approvalData, setApprovalData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg-${messageIdCounter.current}`;
  };
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'supervisor',
      name: 'Supervisor Agent',
      icon: Cpu,
      status: 'idle',
      progress: 0,
      message: 'Coordinating multi-agent workflow',
      color: 'indigo'
    },
    {
      id: 'analyzer',
      name: 'Disruption Analyzer',
      icon: Search,
      status: 'idle',
      progress: 0,
      message: 'Ready to scan supply chain data',
      color: 'cyan'
    },
    {
      id: 'investigator',
      name: 'Root Cause Investigator',
      icon: Brain,
      status: 'idle',
      progress: 0,
      message: 'Waiting for disruption data',
      color: 'blue'
    },
    {
      id: 'recommender',
      name: 'Mitigation Recommender',
      icon: Lightbulb,
      status: 'idle',
      progress: 0,
      message: 'Standing by for analysis results',
      color: 'teal'
    },
    {
      id: 'communicator',
      name: 'Communicator Agent',
      icon: Activity,
      status: 'idle',
      progress: 0,
      message: 'Ready to generate reports',
      color: 'green'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll disabled to prevent forced scrolling during demo
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const handleApprove = async (selectedStrategies: number[]) => {
    setAwaitingApproval(false);
    setIsProcessing(true);

    const approvalMsg: Message = {
      id: generateMessageId(),
      role: 'user',
      content: `✅ Approved ${selectedStrategies.length} mitigation strateg${selectedStrategies.length === 1 ? 'y' : 'ies'} for implementation`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, approvalMsg]);

    // Simulate implementation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const implementationMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: `🚀 Implementation In Progress\n\nApproved strategies are being executed:\n${approvalData.mitigationStrategies
        .filter((s: any) => selectedStrategies.includes(s.id))
        .map((s: any) => `\n• ${s.title}\n  Status: Initiating...\n  Timeline: ${s.timeline}\n  Actions: ${s.actions.join(', ')}`)
        .join('\n')}\n\n📧 Stakeholder notifications sent to logistics teams, NGO leadership, and clinic directors.\n\n📊 Implementation tracking activated. You can monitor progress in the Operations Dashboard.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, implementationMsg]);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const completionMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: `✅ Implementation Initiated Successfully\n\nAll approved actions are now in motion:\n• Emergency response teams deployed\n• Stakeholders notified and coordinating\n• Real-time tracking enabled\n• Audit trail logged for accountability\n\nEstimated time to full implementation: 24-72 hours\nNext checkpoint: 6 hours for status update`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, completionMsg]);

    setIsProcessing(false);
    toast.success('Strategies Approved & Implemented', {
      description: `${selectedStrategies.length} mitigation strateg${selectedStrategies.length === 1 ? 'y' : 'ies'} now in progress`
    });
  };

  const handleReject = async (reason: string) => {
    setAwaitingApproval(false);
    setIsProcessing(true);

    const rejectionMsg: Message = {
      id: generateMessageId(),
      role: 'user',
      content: `❌ Recommendations Rejected\n\nReason: ${reason}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, rejectionMsg]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const responseMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: `📝 Feedback Received\n\nI understand the current recommendations don't meet requirements. I can:\n\n1. Re-analyze with different parameters\n2. Explore alternative mitigation approaches\n3. Provide more detailed cost-benefit analysis\n4. Consult additional data sources\n\nWhat would you like me to focus on for the revised analysis?`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, responseMsg]);

    setIsProcessing(false);
    toast.info('Recommendations Rejected', {
      description: 'Ready for revised analysis with your feedback'
    });
  };

  const updateAgentStatus = (agentId: string, status: Agent['status'], progress: number, message: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status, progress, message }
        : agent
    ));
  };

  const simulateAgentWorkflow = async (userQuery: string) => {
    setIsProcessing(true);

    // Add supervisor acknowledgment
    const supervisorMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: `Initiating multi-agent analysis for: "${userQuery}". Orchestrating workflow through ReAct reasoning framework.`,
      timestamp: new Date(),
      agentUpdates: []
    };
    setMessages(prev => [...prev, supervisorMsg]);

    // Phase 1: Supervisor activates
    await new Promise(resolve => setTimeout(resolve, 800));
    updateAgentStatus('supervisor', 'active', 25, 'Analyzing query and planning agent workflow');
    
    // Phase 2: Disruption Analyzer
    await new Promise(resolve => setTimeout(resolve, 1200));
    updateAgentStatus('supervisor', 'active', 40, 'Activating Disruption Analyzer');
    updateAgentStatus('analyzer', 'active', 0, 'Scanning ReliefWeb crisis data');

    // Fetch real crisis data
    let crisisContext = '';
    try {
      const reports = await fetchSupplyChainReports(1);
      if (reports.length > 0) {
        const report = reports[0];
        crisisContext = `Found: ${report.fields.title} in ${report.fields.country?.[0]?.name || 'affected region'}`;
        updateAgentStatus('analyzer', 'active', 50, crisisContext);
      }
    } catch (error) {
      crisisContext = 'Analyzing supply chain disruptions';
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    updateAgentStatus('analyzer', 'complete', 100, 'Disruption analysis complete');
    
    const analyzerMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: `✓ Disruption Analyzer: Identified critical supply chain vulnerabilities. ${crisisContext}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, analyzerMsg]);

    // Phase 3: Root Cause Investigator
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateAgentStatus('supervisor', 'active', 60, 'Activating Root Cause Investigator');
    updateAgentStatus('investigator', 'active', 0, 'Investigating underlying causes');
    
    await new Promise(resolve => setTimeout(resolve, 1800));
    updateAgentStatus('investigator', 'active', 70, 'Analyzing transportation, weather, and inventory data');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    updateAgentStatus('investigator', 'complete', 100, 'Root cause analysis complete');
    
    const investigatorMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: '✓ Root Cause Investigator: Identified primary disruption factors including transportation delays, weather conditions, and inventory constraints.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, investigatorMsg]);

    // Phase 4: Mitigation Recommender
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateAgentStatus('supervisor', 'active', 80, 'Activating Mitigation Recommender');
    updateAgentStatus('recommender', 'active', 0, 'Generating mitigation strategies');
    
    await new Promise(resolve => setTimeout(resolve, 1600));
    updateAgentStatus('recommender', 'active', 60, 'Optimizing routes and timelines');
    
    await new Promise(resolve => setTimeout(resolve, 1400));
    updateAgentStatus('recommender', 'complete', 100, 'Mitigation plan ready');
    
    const recommenderMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: '✓ Mitigation Recommender: Generated 3 actionable strategies with cost estimates, timelines, and risk assessments.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, recommenderMsg]);

    // Phase 5: Communicator
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateAgentStatus('supervisor', 'active', 90, 'Activating Communicator Agent');
    updateAgentStatus('communicator', 'active', 0, 'Preparing stakeholder reports');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateAgentStatus('communicator', 'complete', 100, 'Reports generated for all audiences');
    
    const communicatorMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: '✓ Communicator Agent: Generated targeted messages for logistics teams, NGO leadership, and clinic directors.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, communicatorMsg]);

    // Final summary
    await new Promise(resolve => setTimeout(resolve, 800));
    updateAgentStatus('supervisor', 'complete', 100, 'Workflow complete - Analysis ready for review');
    
    const recommendations = {
      impact: {
        priority: 'HIGH',
        affectedRoutes: ['North-South Corridor', 'East Supply Line'],
        estimatedDelay: '72-96 hours',
        criticalSupplies: ['Medical supplies', 'Food aid', 'Water purification']
      },
      rootCauses: [
        { cause: 'Transportation delays', severity: 'High', confidence: 0.92 },
        { cause: 'Weather impacts (flooding)', severity: 'Medium', confidence: 0.85 },
        { cause: 'Inventory gaps at regional hubs', severity: 'High', confidence: 0.88 }
      ],
      mitigationStrategies: [
        {
          id: 1,
          title: 'Emergency Air Transport',
          cost: '$45,000',
          timeline: '24-48 hours',
          risk: 'Low',
          impact: 'Immediate relief for critical supplies',
          actions: ['Charter cargo aircraft', 'Coordinate airfield access', 'Deploy ground teams for distribution']
        },
        {
          id: 2,
          title: 'Alternative Route Activation',
          cost: '$15,000',
          timeline: '48-72 hours',
          risk: 'Medium',
          impact: 'Sustainable secondary supply line',
          actions: ['Survey western route', 'Negotiate border crossing', 'Establish relay stations']
        },
        {
          id: 3,
          title: 'Local Procurement + Redistribution',
          cost: '$28,000',
          timeline: '36-60 hours',
          risk: 'Medium-High',
          impact: 'Reduces dependency on external supply',
          actions: ['Source local suppliers', 'Quality verification', 'Redistribute from surplus hubs']
        }
      ],
      stakeholderCommunications: {
        logistics: 'Detailed route analysis and vehicle deployment schedule',
        leadership: 'Budget approval request for emergency measures',
        clinics: 'Supply status updates and expected delivery timelines'
      }
    };

    const finalMsg: Message = {
      id: generateMessageId(),
      role: 'supervisor',
      content: `🎯 Analysis Complete (20 minutes)\n\nMulti-agent workflow successfully orchestrated. All 5 agents have completed their analysis. Key findings:\n\n• Disruption Impact: High priority supply chain issues identified\n• Root Causes: Transportation delays, weather impacts, inventory gaps\n• Mitigation Options: 3 strategies ranked by cost, timeline, and risk\n• Stakeholder Communications: Ready for logistics, leadership, and clinic teams\n\n⚠️ Human Approval Required: Review recommendations before implementation.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, finalMsg]);

    setApprovalData(recommendations);
    setAwaitingApproval(true);
    setIsProcessing(false);
    toast.info('Awaiting Human Approval', {
      description: 'Review the recommended mitigation strategies'
    });

    // Send WhatsApp notification for high-cost approvals
    const highestCost = Math.max(
      ...recommendations.mitigationStrategies.map(s => 
        parseInt(s.cost.replace(/[^0-9]/g, ''))
      )
    );
    
    if (highestCost > 10000) {
      // Extract location and cargo type from user query
      const location = userQuery.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/)?.[0] || 'Unknown';
      const cargoType = userQuery.toLowerCase().includes('vaccine') ? 'Vaccines' :
                        userQuery.toLowerCase().includes('blood') ? 'Blood supplies' :
                        userQuery.toLowerCase().includes('medical') ? 'Medical supplies' :
                        'Critical cargo';
      
      notifyApprovalRequired(
        'HIGH',
        location,
        cargoType,
        recommendations.impact.criticalSupplies.length * 100, // Estimated people
        highestCost,
        recommendations.mitigationStrategies[0].timeline
      ).then(success => {
        if (success) {
          toast.success('WhatsApp notification sent', {
            description: 'Approval request delivered to your phone'
          });
        }
      });
    }

    // Also notify for critical disruptions
    notifyCriticalDisruption(
      'HIGH',
      userQuery.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/)?.[0] || 'Unknown',
      userQuery.toLowerCase().includes('vaccine') ? 'Vaccines' : 'Critical supplies',
      500
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Reset all agents
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'idle',
      progress: 0
    })));

    await simulateAgentWorkflow(input);
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'complete': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'error': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Pause className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between backdrop-blur-xl dark:bg-slate-800/50 light:bg-white/80 border dark:border-slate-700/50 light:border-slate-300 rounded-2xl p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="dark:text-white light:text-slate-700">IBM watsonx Orchestrate</h3>
            <p className="text-sm dark:text-slate-400 light:text-slate-600">Real-time AI agent integration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 dark:bg-slate-700/50 light:bg-slate-200 rounded-lg">
            <button
              onClick={() => setChatMode('live')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                chatMode === 'live'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'dark:text-slate-400 light:text-slate-600 hover:text-indigo-400'
              }`}
            >
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Live Chat
              </span>
            </button>
            <button
              onClick={() => setChatMode('demo')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                chatMode === 'demo'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'dark:text-slate-400 light:text-slate-600 hover:text-indigo-400'
              }`}
            >
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                Demo Mode
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className={chatMode === 'live' ? 'w-full' : 'grid lg:grid-cols-3 gap-6'}>
        {/* Agent Status Panel - Only show in Demo mode */}
        <AnimatePresence>
        {chatMode === 'demo' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="lg:col-span-1"
        >
          <div className="backdrop-blur-xl dark:bg-slate-800/50 light:bg-white/80 border dark:border-slate-700/50 light:border-slate-300 rounded-2xl overflow-hidden sticky top-24">
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">Agent Status</h3>
                    <p className="text-white/80 text-xs">Multi-agent system</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAgentPanel(!showAgentPanel)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                >
                  {showAgentPanel ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {/* Agents List */}
            <AnimatePresence>
              {showAgentPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 space-y-3"
                >
                  {/* Demo Mode: Agent status display */}
                  {agents.map((agent, index) => {
                    const Icon = agent.icon;
                      return (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="backdrop-blur-xl dark:bg-slate-900/50 light:bg-slate-100 rounded-xl p-4 border dark:border-slate-700/30 light:border-slate-200"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-${agent.color}-500/20`}>
                              <Icon className={`w-5 h-5 text-${agent.color}-400`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="dark:text-white light:text-slate-700 text-sm">{agent.name}</h4>
                                <div className={`px-2 py-0.5 rounded-full border text-xs flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                                  {getStatusIcon(agent.status)}
                                  <span className="capitalize">{agent.status}</span>
                                </div>
                              </div>
                              <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-xs">{agent.message}</p>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          {agent.status === 'active' && (
                            <div className="w-full bg-slate-700/30 dark:bg-slate-700/30 light:bg-slate-300 rounded-full h-1.5 overflow-hidden">
                              <motion.div
                                className={`h-full bg-${agent.color}-500 rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${agent.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        )}
        </AnimatePresence>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={chatMode === 'live' ? 'w-full' : 'lg:col-span-2'}
        >
          <div className="backdrop-blur-xl dark:bg-slate-800/50 light:bg-white/80 border dark:border-slate-700/50 light:border-slate-300 rounded-2xl overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <LogoIcon variant="white" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-white">{chatMode === 'live' ? selectedAgent.name : 'Chain AI Supervisor'}</h2>
                  <p className="text-white/90 text-sm">
                    {chatMode === 'live' 
                      ? `IBM watsonx Orchestrate • ${selectedAgent.description}` 
                      : 'Emergency Supply Chain Response System'}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-sm">{chatMode === 'live' ? 'Live' : 'Demo'}</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            {chatMode === 'live' ? (
              <div className="h-[500px] dark:bg-slate-900/30 light:bg-slate-50/50">
                <WatsonXChat 
                  agent={selectedAgent}
                  onChatReady={() => {
                    toast.success('Connected to ' + selectedAgent.name, {
                      description: 'IBM watsonx Orchestrate agent ready'
                    });
                  }}
                  className="h-full"
                />
              </div>
            ) : (
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 dark:bg-slate-900/30 light:bg-slate-50/50">
                {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role !== 'user' && (
                    <div className={`p-2 rounded-lg ${
                      message.role === 'supervisor' 
                        ? 'bg-indigo-500/20' 
                        : 'bg-slate-500/20'
                    }`}>
                      {message.role === 'supervisor' ? (
                        <Cpu className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <Activity className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                      : message.role === 'supervisor'
                      ? 'dark:bg-slate-800/80 light:bg-white border dark:border-slate-700 light:border-slate-200'
                      : 'dark:bg-slate-800/50 light:bg-slate-100 border dark:border-slate-700/50 light:border-slate-200'
                  }`}>
                    <p className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user' 
                        ? 'text-white' 
                        : 'dark:text-slate-200 light:text-slate-800'
                    }`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-white/70'
                        : 'text-slate-500 dark:text-slate-500 light:text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Approval Interface */}
            {awaitingApproval && approvalData && chatMode === 'demo' && (
              <div className="p-6 dark:bg-slate-900/50 light:bg-slate-50 border-t dark:border-slate-700/50 light:border-slate-200">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold dark:text-white light:text-slate-700 mb-2">Review Mitigation Strategies</h3>
                  <p className="text-sm dark:text-slate-400 light:text-slate-600">Select strategies to approve for implementation</p>
                </div>

                <div className="space-y-3 mb-6">
                  {approvalData.mitigationStrategies.map((strategy: any) => (
                    <div key={strategy.id} className="dark:bg-slate-800/50 light:bg-white border dark:border-slate-700 light:border-slate-300 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium dark:text-white light:text-slate-700">{strategy.title}</h4>
                          <p className="text-sm dark:text-slate-400 light:text-slate-600 mt-1">{strategy.impact}</p>
                        </div>
                        <input
                          type="checkbox"
                          id={`strategy-${strategy.id}`}
                          defaultChecked={strategy.id === 1}
                          className="mt-1 w-4 h-4 accent-indigo-600"
                          aria-label={`Select ${strategy.title}`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="dark:text-slate-500 light:text-slate-400">Cost:</span>
                          <span className="ml-2 dark:text-white light:text-slate-700">{strategy.cost}</span>
                        </div>
                        <div>
                          <span className="dark:text-slate-500 light:text-slate-400">Timeline:</span>
                          <span className="ml-2 dark:text-white light:text-slate-700">{strategy.timeline}</span>
                        </div>
                        <div>
                          <span className="dark:text-slate-500 light:text-slate-400">Risk:</span>
                          <span className={`ml-2 ${strategy.risk === 'Low' ? 'text-green-400' : strategy.risk === 'Medium' ? 'text-yellow-400' : 'text-orange-400'}`}>{strategy.risk}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs dark:text-slate-400 light:text-slate-600">
                        <strong>Actions:</strong> {strategy.actions.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const selected = approvalData.mitigationStrategies
                        .filter((_: any, idx: number) => {
                          const checkbox = document.getElementById(`strategy-${idx + 1}`) as HTMLInputElement;
                          return checkbox?.checked;
                        })
                        .map((s: any) => s.id);
                      if (selected.length > 0) {
                        handleApprove(selected);
                      } else {
                        toast.error('Please select at least one strategy');
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Approve & Implement</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason) {
                        handleReject(reason);
                      }
                    }}
                    className="flex-1 px-6 py-3 dark:bg-slate-700/50 light:bg-slate-200 dark:text-white light:text-slate-700 rounded-xl hover:bg-red-500/20 hover:text-red-400 dark:hover:text-red-400 light:hover:text-red-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject & Revise</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input Area - Only show in demo mode */}
            {chatMode === 'demo' && (
            <div className="p-4 dark:bg-slate-800/50 light:bg-white border-t dark:border-slate-700/50 light:border-slate-200">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Describe a supply chain disruption..."
                  className="flex-1 px-4 py-3 dark:bg-slate-900/50 light:bg-slate-100 border dark:border-slate-700 light:border-slate-300 rounded-xl dark:text-white light:text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setInput('Vaccine shipment delayed due to port closure in East Africa')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs dark:bg-slate-700/50 light:bg-slate-200 dark:text-slate-300 light:text-slate-700 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 dark:hover:text-indigo-400 light:hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                  Vaccine delay scenario
                </button>
                <button
                  onClick={() => setInput('Medical supplies stuck due to extreme weather conditions')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs dark:bg-slate-700/50 light:bg-slate-200 dark:text-slate-300 light:text-slate-700 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 dark:hover:text-indigo-400 light:hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                  Weather disruption
                </button>
                <button
                  onClick={() => setInput('Emergency medical inventory shortage in refugee camps')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs dark:bg-slate-700/50 light:bg-slate-200 dark:text-slate-300 light:text-slate-700 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 dark:hover:text-indigo-400 light:hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                  Inventory shortage
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 backdrop-blur-xl dark:bg-indigo-900/20 light:bg-indigo-50 border dark:border-indigo-500/30 light:border-indigo-200 rounded-xl p-4"
          >
            {chatMode === 'live' ? (
              <div>
                <p className="text-sm dark:text-indigo-300 light:text-indigo-900 mb-2">
                  <strong>Live IBM watsonx Orchestrate Connection:</strong> You are now chatting with a real AI agent powered by IBM watsonx Orchestrate. This integration uses the official embedded webchat SDK with custom styling to match Chain AI's premium design system.
                </p>
                <div className="flex items-center gap-2 text-xs dark:text-indigo-400 light:text-indigo-700">
                  <ExternalLink className="w-3 h-3" />
                  <span>Connected to: {selectedAgent.name} (Agent ID: {selectedAgent.agentId.slice(0, 8)}...)</span>
                </div>
              </div>
            ) : (
              <p className="text-sm dark:text-indigo-300 light:text-indigo-900">
                <strong>Demo Multi-Agent System:</strong> The Supervisor orchestrates 5 specialized AI agents using IBM watsonx Orchestrate and ReAct reasoning framework. Real crisis data from ReliefWeb API. Switch to "Live Chat" mode to interact with real watsonx agents.
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
