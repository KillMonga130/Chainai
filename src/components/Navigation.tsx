import { useState } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { ChainAILogo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { WatsonXConnectionStatus } from './WatsonXConnectionStatus';
import { WatsonXSetupValidator } from './WatsonXSetupValidator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-[var(--z-sticky)] dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-lg border-b dark:border-slate-800/50 light:border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ChainAILogo size="md" animated={false} />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Agents', 'Impact', 'Try Now'].map((item, index) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className="text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Diagnostics Dialog */}
            <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
              <DialogTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65 }}
                  className="p-2 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/50 rounded-lg transition-all duration-300"
                  title="System Diagnostics"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-xl dark:bg-slate-900/95 light:bg-white/95 border dark:border-slate-700 light:border-slate-300">
                <DialogHeader>
                  <DialogTitle className="dark:text-white light:text-slate-900">System Diagnostics</DialogTitle>
                  <DialogDescription className="dark:text-slate-400 light:text-slate-600">
                    Monitor IBM watsonx Orchestrate connection and validate configuration
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="status" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="status">Connection Status</TabsTrigger>
                    <TabsTrigger value="validator">Configuration Validator</TabsTrigger>
                  </TabsList>
                  <TabsContent value="status" className="mt-6">
                    <WatsonXConnectionStatus />
                  </TabsContent>
                  <TabsContent value="validator" className="mt-6">
                    <WatsonXSetupValidator />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('try-now')}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              className="p-2 text-white dark:text-white light:text-slate-900 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-3">
                {['Features', 'Agents', 'Impact', 'Try Now'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                    className="block w-full text-left px-4 py-3 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => scrollToSection('try-now')}
                  className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
