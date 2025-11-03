import { motion } from 'motion/react';

interface MetricCardProps {
  value: string;
  label: string;
  subtitle?: string;
  index?: number;
}

export function MetricCard({ value, label, subtitle, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="group relative"
    >
      <div className="backdrop-blur-xl dark:bg-slate-800/30 light:bg-white/60 border dark:border-slate-700/50 light:border-slate-200 rounded-2xl p-8 text-center dark:hover:bg-slate-800/50 light:hover:bg-white/80 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
        {/* Value */}
        <motion.div
          className="mb-2 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.div>
        
        {/* Label */}
        <div className="text-white/90 dark:text-white/90 light:text-slate-900 font-medium mb-1">
          {label}
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <div className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">
            {subtitle}
          </div>
        )}

        {/* Decorative glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-600 group-hover:w-3/4 transition-all duration-500 rounded-full" />
      </div>
    </motion.div>
  );
}
