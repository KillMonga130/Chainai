import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-14 rounded-full backdrop-blur-xl dark:bg-slate-800/50 light:bg-white/80 border dark:border-slate-700/50 light:border-slate-300 hover:scale-110 transition-all duration-300 flex items-center justify-center group overflow-hidden"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with animation */}
      <div className="relative w-6 h-6">
        {/* Sun icon */}
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : 180,
            opacity: theme === 'light' ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-6 h-6 text-amber-500" />
        </motion.div>

        {/* Moon icon */}
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : -180,
            opacity: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-6 h-6 text-indigo-400" />
        </motion.div>
      </div>

      {/* Rotating ring effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: theme === 'light' ? '#f59e0b' : '#6366f1',
          borderRightColor: theme === 'light' ? '#f59e0b' : '#6366f1',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </motion.button>
  );
}
