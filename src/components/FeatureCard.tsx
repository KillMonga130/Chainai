import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl dark:bg-slate-800/50 light:bg-white/80 backdrop-blur-sm border dark:border-slate-700/50 light:border-slate-200 hover:border-indigo-500/50 transition-all duration-300 p-8"
    >
      {/* Gradient Overlay (Appears on Hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        {/* Title */}
        <h3 className="text-white dark:text-white light:text-slate-900 mb-3">{title}</h3>
        
        {/* Description */}
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">{description}</p>
      </div>

      {/* Glow Effect (Bottom Edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700" />
    </motion.div>
  );
}
