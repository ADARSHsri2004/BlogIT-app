import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-100"
            aria-label="Toggle theme"
        >
            <motion.div
                layout
                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {isDark ? '🌙' : '☀️'}
            </motion.div>
            <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
        </button>
    );
};

export default ThemeToggle;

