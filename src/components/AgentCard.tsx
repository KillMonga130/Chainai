import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface AgentCardProps {
  number: number;
  title: string;
  description: string;
  status: 'LIVE' | 'BETA';
  index?: number;
}

export function AgentCard({ number, title, description, status, index = 0 }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ x: 8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border-l-4 border-indigo-500 p-6 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Number badge */}
        <div className="mb-4 inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white text-xl font-bold">{number}</span>
        </div>
        
        {/* Status badge */}
        <div className="mb-3">
          <Badge 
            variant={status === 'LIVE' ? 'default' : 'secondary'}
            className={`${
              status === 'LIVE' 
                ? 'bg-teal-500/20 text-teal-400 border-teal-500/50' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
            } border`}
          >
            {status}
          </Badge>
        </div>
        
        {/* Title */}
        <h3 className="text-white mb-2">{title}</h3>
        
        {/* Description */}
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Hover shine effect */}
      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-full transition-all duration-700" />
    </motion.div>
  );
}
