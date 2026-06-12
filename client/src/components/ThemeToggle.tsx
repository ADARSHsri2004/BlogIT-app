import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex h-10 items-center gap-2 overflow-hidden rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      aria-label="Toggle theme"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <motion.div
        layout
        className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ opacity: 0, rotate: -45, y: 8 }}
            animate={{ opacity: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, rotate: 45, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {isDark ? <Moon size={14} /> : <Sun size={14} />}
          </motion.span>
        </AnimatePresence>
      </motion.div>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
};

export default ThemeToggle;
