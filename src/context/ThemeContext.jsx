import { createContext, useContext, useEffect, useState } from'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
 const [theme, setTheme] = useState(() => {
 const stored = localStorage.getItem('arguex-theme');
 if (stored) return stored;
 // Respect OS preference
 return window.matchMedia('(prefers-color-scheme: dark)').matches ?'dark' :'light';
 });

 useEffect(() => {
 const root = document.documentElement;
 if (theme ==='dark') {
 root.classList.add('dark');
 } else {
 root.classList.remove('dark');
 }
 localStorage.setItem('arguex-theme', theme);
 }, [theme]);

 const toggleTheme = () => setTheme(t => (t ==='dark' ?'light' :'dark'));

 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
}

export function useTheme() {
 const ctx = useContext(ThemeContext);
 if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
 return ctx;
}

export default ThemeContext;
