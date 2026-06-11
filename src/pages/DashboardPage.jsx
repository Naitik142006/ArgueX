import { useEffect, useState } from'react';
import { Link, useNavigate } from'react-router-dom';
import { motion } from'framer-motion';
import { Swords, Plus, History, Trophy, TrendingUp, ChevronRight, Zap, Target, Activity, Crosshair } from'lucide-react';
import { useAuth } from'../context/AuthContext.jsx';
import { fetchUserDebates } from'../services/debateService.js';
import { userAPI } from'../services/api.js';
import Card from'../components/ui/Card.jsx';
import Button from'../components/ui/Button.jsx';
import Badge from'../components/ui/Badge.jsx';
import EmptyState from'../components/ui/EmptyState.jsx';
import { SkeletonCard } from'../components/ui/Skeleton.jsx';

export default function DashboardPage() {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [debates, setDebates] = useState([]);
 const [analytics, setAnalytics] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const loadDashboard = async () => {
 try {
 const [debatesData, analyticsData] = await Promise.all([
 fetchUserDebates(),
 userAPI.getAnalytics()
 ]);
 setDebates(debatesData);
 setAnalytics(analyticsData);
 } catch (error) {
 console.error('Failed to load dashboard:', error);
 } finally {
 setLoading(false);
 }
 };
 loadDashboard();
 }, []);

 const stats = [
 { label:'Total Matches', value: analytics?.totalDebates || 0, icon: Crosshair, color:'text-brand-400', shadow:'' },
 { label:'Win Rate', value:`${analytics?.winRate || 0}%`, icon: Target, color:'text-emerald-400', shadow:'' },
 { label:'Hot Streak', value: analytics?.currentStreak || 0, icon: Zap, color:'text-rose-500', shadow:'' },
 { label:'Global Rank', value: analytics?.rank ||'Unranked', icon: Trophy, color:'text-rank-gold', shadow:'' },
 ];

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in relative">
 {/* Background ambient glow */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
 {/* Header section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
 <div>
 <Badge variant="brand" className="mb-4 bg-brand-500/10 text-brand-400 border-brand-500/20">
 <span className="flex items-center gap-2">
 <Activity size={14} className="animate-pulse" />
 SYSTEM ONLINE
 </span>
 </Badge>
 <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight uppercase">
 Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-neon-cyan">Control</span>
 </h1>
 <p className="text-zinc-400 mt-2 font-mono text-sm uppercase tracking-widest">
 Welcome back, Agent <span className="text-white font-bold">{user?.username}</span>
 </p>
 </div>
 <div className="flex items-center gap-4">
 <Link to={`/multiplayer/${Math.random().toString(36).substring(2, 10)}`}>
 <Button variant="outline" className="gap-2">
 <Swords size={18} className="text-brand-400" />
 PVP Match
 </Button>
 </Link>
 <Link to="/debate">
 <Button variant="neon" icon={<Plus size={18} />}>
 Train vs AI
 </Button>
 </Link>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
 {stats.map((stat, i) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1, duration: 0.4 }}
 >
 <div className={`glass-panel p-6 h-full relative overflow-hidden group hover:${stat.shadow} transition-shadow duration-300`}>
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
 <div className="flex items-start justify-between relative z-10">
 <div>
 <p className="text-xs font-mono font-semibold tracking-widest text-zinc-500 uppercase">{stat.label}</p>
 <p className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">{stat.value}</p>
 </div>
 <div className={`p-3 rounded-xl bg-surface border border-white/5 ${stat.color} shadow-glass`}>
 <stat.icon size={24} />
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>

 <div className="grid lg:grid-cols-[1fr_320px] gap-8">
 {/* Main Content: Recent Debates */}
 <div className="glass-panel p-6 sm:p-8">
 <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
 <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
 <History size={24} className="text-zinc-500" />
 Combat Log
 </h2>
 <Link to="/profile" className="text-sm font-mono font-semibold text-brand-400 hover:text-neon-cyan transition-colors flex items-center gap-1 uppercase tracking-wide">
 Full Record <ChevronRight size={16} />
 </Link>
 </div>

 <div className="space-y-4">
 {loading ? (
 [1, 2, 3].map(i => <SkeletonCard key={i} />)
 ) : debates.length === 0 ? (
 <EmptyState
 icon={Swords}
 title="No Data Available"
 description="Your combat log is empty. Enter the arena to begin tracking your performance."
 action={
 <Link to="/debate">
 <Button variant="neon">Enter Arena</Button>
 </Link>
 }
 />
 ) : (
 debates.map((debate, i) => (
 <motion.div
 key={debate._id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.05, duration: 0.3 }}
 >
 <div onClick={() => navigate(`/debate/${debate._id}`)}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-white/5 hover:border-brand-500/30 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
 >
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2">
 <Badge variant="brand" className="bg-brand-500/20 text-brand-400 border-transparent">AI Training</Badge>
 <span className="text-xs font-mono text-zinc-500">
 {new Date(debate.createdAt).toLocaleDateString()}
 </span>
 </div>
 <h3 className="text-lg font-heading font-bold text-white truncate group-hover:text-neon-cyan transition-colors">
 {debate.topic}
 </h3>
 </div>
 <div className="flex items-center gap-6 shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
 <div className="text-right">
 <p className="text-lg font-mono font-bold text-white">{debate.messages?.length || 0}</p>
 <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">exchanges</p>
 </div>
 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
 <ChevronRight className="text-zinc-400 group-hover:text-neon-cyan" />
 </div>
 </div>
 </div>
 </motion.div>
 ))
 )}
 </div>
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 <div className="glass-panel p-6">
 <h3 className="text-lg font-heading font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
 <Activity size={18} className="text-neon-cyan" />
 Trending Scenarios
 </h3>
 <div className="space-y-3">
 {["Is AI conscious?","Universal Basic Income","Space Exploration vs Earth","Social Media Regulation"
 ].map((topic, i) => (
 <button
 key={i}
 className="w-full text-left p-4 rounded-xl bg-surface border border-white/5 hover:border-brand-500/30 hover:bg-white/5 transition-all duration-300 group flex items-center justify-between"
 >
 <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{topic}</span>
 <Plus size={16} className="text-zinc-600 group-hover:text-neon-cyan" />
 </button>
 ))}
 </div>
 </div>
 <div className="glass-panel p-6 bg-gradient-to-br from-surface to-brand-900/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-[50px]"></div>
 <h3 className="text-lg font-heading font-bold text-white mb-2 uppercase">Pro League</h3>
 <p className="text-sm text-zinc-400 mb-6">Unlock Grandmaster rank to access exclusive tournaments and prize pools.</p>
 <div className="w-full bg-surface rounded-full h-2 mb-2 border border-white/5 overflow-hidden">
 <div className="bg-gradient-to-r from-brand-500 to-neon-cyan h-full rounded-full" style={{ width:'45%' }}></div>
 </div>
 <div className="flex justify-between text-xs font-mono text-zinc-500">
 <span>Gold II</span>
 <span className="text-brand-400">45% to Master</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
