import { WatsonXAgent } from '../services/watsonx-config';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface AgentSelectorProps {
  agents: WatsonXAgent[];
  selectedAgent: WatsonXAgent;
  onSelectAgent: (agent: WatsonXAgent) => void;
}

export function AgentSelector({ agents, selectedAgent, onSelectAgent }: AgentSelectorProps) {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      indigo: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500',
        text: 'text-indigo-400',
        hover: 'hover:bg-indigo-500/20'
      },
      cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500',
        text: 'text-cyan-400',
        hover: 'hover:bg-cyan-500/20'
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-500/20'
      },
      teal: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500',
        text: 'text-teal-400',
        hover: 'hover:bg-teal-500/20'
      },
      green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500',
        text: 'text-green-400',
        hover: 'hover:bg-green-500/20'
      }
    };

    const scheme = colors[color] || colors.indigo;
    return `${scheme.bg} ${isSelected ? scheme.border + ' border-2' : 'border border-zinc-700'} ${scheme.text} ${scheme.hover}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Agent Selection</h3>
          <p className="text-sm text-zinc-400">Choose which agent to interact with</p>
        </div>
        <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700">
          {agents.length} Agents Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {agents.map((agent) => {
          const isSelected = selectedAgent.id === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`
                p-4 rounded-lg text-left transition-all duration-200
                ${getColorClasses(agent.color, isSelected)}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-zinc-500
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-zinc-100">{agent.name}</span>
                    {isSelected && (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {agent.description}
                  </p>
                </div>
                <div className="ml-4">
                  {isSelected ? (
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-zinc-600" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-zinc-100 mb-1">Context Injection Active</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All agents automatically receive enriched context from the Live Crisis Feed (ReliefWeb + Weather).
              The Supervisor agent orchestrates workflows across all specialized agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
