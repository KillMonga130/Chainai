import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { LogoIcon } from './Logo';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Port congestion at Rotterdam - 350 vaccines stuck, 4 days delayed",
  "Storm weather affecting departure - humanitarian medical supplies",
  "Carrier failure - need diagnosis and mitigation options"
];

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Chain AI Supervisor. Report your supply chain crisis, and I'll coordinate with my team of specialized agents to analyze the situation and provide solutions in under 20 minutes.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `🔍 **Analyzing your supply chain disruption...**\n\nI'm coordinating with:\n• Disruption Analyzer\n• Root Cause Investigator\n• Mitigation Recommender\n\nThis analysis typically takes 15-20 minutes.\n\n*In a real deployment, this would connect to IBM watsonx Orchestrate to process your request with our multi-agent system.*`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Chat container with glassmorphic effect */}
      <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
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

        {/* Messages area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'backdrop-blur-xl bg-slate-800/80 border border-slate-700/50 text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <span className={`mt-2 block text-xs ${message.sender === 'user' ? 'text-white/60' : 'text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="backdrop-blur-xl bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="p-4 bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50">
          <p className="mb-3 text-slate-400 text-sm">Quick start prompts:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-2 backdrop-blur-xl bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-700/70 hover:border-indigo-500/50 transition-all duration-300 text-slate-300 text-sm"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your supply chain disruption..."
              className="flex-1 px-4 py-3 backdrop-blur-xl bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            />
            <Button
              onClick={handleSend}
              className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-6 backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center"
      >
        <p className="text-slate-400 text-sm">
          <strong className="text-indigo-400">Demo Mode:</strong> In production, this connects to IBM watsonx Orchestrate for real multi-agent analysis.
        </p>
      </motion.div>
    </motion.div>
  );
}
