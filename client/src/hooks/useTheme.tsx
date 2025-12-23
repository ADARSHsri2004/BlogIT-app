import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const applyThemeClass = (mode: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
};

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
        applyThemeClass(stored);
        return stored;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = prefersDark ? 'dark' : 'light';
    applyThemeClass(mode);
    return mode;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useLayoutEffect(() => {
        applyThemeClass(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

