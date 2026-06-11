import { useState, useEffect, useRef } from'react';
import { Link, NavLink, useNavigate } from'react-router-dom';
import {
 Swords, LayoutDashboard, User, LogOut,
 Menu, X, ChevronDown, Zap, Trophy,
} from'lucide-react';
import { useAuth } from'../context/AuthContext.jsx';
import Avatar from'./ui/Avatar.jsx';
import Button from'./ui/Button.jsx';

export default function Navbar() {
 const { isLoggedIn, user, logout } = useAuth();
 const navigate = useNavigate();
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const dropdownRef = useRef(null);

 useEffect(() => {
 const onScroll = () => setScrolled(window.scrollY > 10);
 window.addEventListener('scroll', onScroll, { passive: true });
 return () => window.removeEventListener('scroll', onScroll);
 }, []);

 useEffect(() => {
 const handler = (e) => {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
 setDropdownOpen(false);
 }
 };
 document.addEventListener('mousedown', handler);
 return () => document.removeEventListener('mousedown', handler);
 }, []);

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
 ['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold tracking-wide uppercase transition-all duration-300',
 isActive
 ?'bg-white/10 text-brand-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10'
 :'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent',
 ].join(' ');

 return (
 <>
 <header
 className={['sticky top-0 z-50 transition-all duration-300','bg-background/60 backdrop-blur-2xl border-b',
 scrolled
 ?'border-white/10 shadow-glass'
 :'border-transparent',
 ].join(' ')}
 >
 <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-20">

 {/* Logo */}
 <Link
 to="/"
 className="flex items-center gap-3 group"
 onClick={() => setMobileOpen(false)}
 >
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-neon-violet flex items-center justify-center group-hover: transition-all duration-300 border border-white/20">
 <Swords size={20} className="text-white drop-" />
 </div>
 <span className="font-heading font-bold text-2xl text-white tracking-tighter">
 Argue<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-neon-cyan">X</span>
 </span>
 </Link>

 {/* Desktop Nav */}
 <nav className="hidden md:flex items-center gap-2">
 {isLoggedIn && (
 <>
 <NavLink to="/dashboard" className={navLinkCls}>
 <LayoutDashboard size={16} />
 Mission Control
 </NavLink>
 <NavLink to="/debate" className={navLinkCls}>
 <Zap size={16} className="text-neon-cyan" />
 Arena
 </NavLink>
 <NavLink to="/leaderboard" className={navLinkCls}>
 <Trophy size={16} className="text-rank-gold" />
 Ranks
 </NavLink>
 </>
 )}
 </nav>

 {/* Desktop Right */}
 <div className="hidden md:flex items-center gap-4">
 {!isLoggedIn ? (
 <>
 <Button variant="ghost" onClick={() => handleNavigate('/login')}>
 Sign in
 </Button>
 <Button variant="brand" onClick={() => handleNavigate('/signup')}>
 Enter Arena
 </Button>
 </>
 ) : (
 <div className="relative" ref={dropdownRef}>
 <button
 onClick={() => setDropdownOpen(v => !v)}
 className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl bg-surface border border-white/5 hover:border-white/20 hover:bg-surface-hover transition-all duration-300 group shadow-glass"
 >
 <Avatar name={user?.username || user?.email} size="sm" online />
 <div className="flex flex-col items-start">
 <span className="text-sm font-heading font-bold text-white leading-none">
 {user?.username ||'User'}
 </span>
 <span className="text-[10px] font-mono text-brand-400 font-semibold tracking-widest uppercase mt-1">
 {user?.elo} ELO
 </span>
 </div>
 <ChevronDown
 size={16}
 className={`text-zinc-500 group-hover:text-white transition-all duration-300 ${dropdownOpen ?'rotate-180 text-white' :''}`}
 />
 </button>

 {/* Dropdown */}
 {dropdownOpen && (
 <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-surface/95 backdrop-blur-xl border border-white/10 py-2 animate-scale-in z-50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
 <div className="px-5 py-3 border-b border-white/10">
 <p className="text-sm font-heading font-bold text-white">
 {user?.username}
 </p>
 <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
 {user?.email}
 </p>
 </div>

 <div className="py-2">
 <button
 onClick={() => handleNavigate('/profile')}
 className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
 >
 <User size={16} />
 Service Record
 </button>
 </div>

 <div className="border-t border-white/10 py-2">
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
 >
 <LogOut size={16} />
 Log Out
 </button>
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Mobile Toggle */}
 <div className="flex md:hidden items-center gap-2">
 <button
 onClick={() => setMobileOpen(v => !v)}
 className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
 aria-label="Toggle menu"
 >
 {mobileOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 </div>
 </div>
 </header>

 {/* Mobile Drawer */}
 {mobileOpen && (
 <div className="fixed inset-0 z-40 md:hidden pt-20">
 <div
 className="absolute inset-0 bg-background/80 backdrop-blur-xl"
 onClick={() => setMobileOpen(false)}
 />
 <div className="absolute top-20 left-0 right-0 bg-surface border-b border-white/10 py-6 px-4 space-y-2 animate-slide-up shadow-glass">
 {isLoggedIn ? (
 <>
 <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-white/5 rounded-2xl border border-white/5">
 <Avatar name={user?.username ||''} size="md" online />
 <div>
 <p className="text-base font-heading font-bold text-white">{user?.username}</p>
 <p className="text-xs font-mono text-brand-400 font-semibold">{user?.elo} ELO</p>
 </div>
 </div>
 <button onClick={() => handleNavigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-heading font-semibold uppercase tracking-wide text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
 <LayoutDashboard size={18} /> Mission Control
 </button>
 <button onClick={() => handleNavigate('/debate')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-heading font-semibold uppercase tracking-wide text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
 <Zap size={18} className="text-neon-cyan" /> Arena
 </button>
 <button onClick={() => handleNavigate('/leaderboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-heading font-semibold uppercase tracking-wide text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
 <Trophy size={18} className="text-rank-gold" /> Ranks
 </button>
 <button onClick={() => handleNavigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-heading font-semibold uppercase tracking-wide text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
 <User size={18} /> Service Record
 </button>
 <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-heading font-semibold uppercase tracking-wide text-rose-400 hover:bg-rose-500/10 transition-colors mt-4">
 <LogOut size={18} /> Log Out
 </button>
 </>
 ) : (
 <div className="flex flex-col gap-3">
 <Button variant="outline" onClick={() => handleNavigate('/login')} className="w-full">
 Sign in
 </Button>
 <Button variant="brand" onClick={() => handleNavigate('/signup')} className="w-full">
 Enter Arena
 </Button>
 </div>
 )}
 </div>
 </div>
 )}
 </>
 );
}
