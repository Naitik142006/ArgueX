import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Swords, LayoutDashboard, User, LogOut,
  Moon, Sun, Menu, X, ChevronDown, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Avatar from './ui/Avatar.jsx';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        w-9 h-9 flex items-center justify-center rounded-xl
        text-zinc-500 dark:text-zinc-400
        hover:bg-zinc-100 dark:hover:bg-zinc-800
        hover:text-zinc-800 dark:hover:text-zinc-200
        transition-all duration-150 focus-ring
      "
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Add border on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on navigate
  const handleNavigate = (to) => {
    setMobileOpen(false);
    setDropdownOpen(false);
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    handleNavigate('/');
  };

  const navLinkCls = ({ isActive }) =>
    [
      'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
      isActive
        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
    ].join(' ');

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 transition-all duration-200',
          'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl',
          scrolled
            ? 'border-b border-zinc-200 dark:border-zinc-800 shadow-sm'
            : 'border-b border-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              <Swords size={16} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
              Argue<span className="gradient-text">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {isLoggedIn && (
              <>
                <NavLink to="/dashboard" className={navLinkCls}>
                  <LayoutDashboard size={15} />
                  Dashboard
                </NavLink>
                <NavLink to="/debate" className={navLinkCls}>
                  <Zap size={15} />
                  Debate
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all duration-150 shadow-glow-sm hover:shadow-glow active:scale-[0.97]"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
                >
                  <Avatar name={user?.username || user?.email} size="sm" online />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {user?.username || 'User'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl surface-elevated shadow-xl py-1.5 animate-scale-in z-50">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {user?.username}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavigate('/profile')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <User size={15} />
                        Profile
                      </button>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 py-4 px-4 space-y-1 animate-slide-up shadow-xl">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2">
                  <Avatar name={user?.username || ''} size="md" online />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user?.username}</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => handleNavigate('/dashboard')} className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button onClick={() => handleNavigate('/debate')} className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Zap size={16} /> Debate
                </button>
                <button onClick={() => handleNavigate('/profile')} className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <User size={16} /> Profile
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNavigate('/login')} className="w-full px-4 py-3 text-sm font-medium text-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  Sign in
                </button>
                <button onClick={() => handleNavigate('/signup')} className="w-full px-4 py-3 text-sm font-semibold text-center text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
