import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Medal, Flame, Shield, Target } from 'lucide-react';
import { userAPI } from '../services/api.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await userAPI.getLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankStyle = (index) => {
    if (index === 0) return { glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    if (index === 1) return { glow: 'shadow-[0_0_20px_rgba(161,161,170,0.2)]', text: 'text-zinc-300', bg: 'bg-zinc-400/10', border: 'border-zinc-400/30' };
    if (index === 2) return { glow: 'shadow-[0_0_20px_rgba(217,119,6,0.2)]', text: 'text-amber-500', bg: 'bg-amber-600/10', border: 'border-amber-600/30' };
    return { glow: '', text: 'text-zinc-500', bg: 'bg-surface', border: 'border-white/5' };
  };

  const getRankBadge = (rank) => {
    const ranks = {
      Bronze: { style: 'bg-orange-950/40 text-orange-400 border-orange-500/20' },
      Silver: { style: 'bg-zinc-800 text-zinc-300 border-zinc-500/20' },
      Gold: { style: 'bg-yellow-950/40 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' },
      Platinum: { style: 'bg-teal-950/40 text-teal-400 border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.2)]' },
      Diamond: { style: 'bg-blue-950/40 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' },
      Master: { style: 'bg-purple-950/40 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
      Grandmaster: { style: 'bg-rose-950/40 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]' }
    };
    return ranks[rank]?.style || ranks.Bronze.style;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-16 animate-fade-in relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="text-center mb-16 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface border border-white/10 shadow-glass mb-8 relative group overflow-hidden">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl group-hover:bg-yellow-500/30 transition-colors"></div>
          <Trophy size={40} className="text-yellow-400 relative z-10" />
        </div>
        <h1 className="text-5xl md:text-6xl font-heading font-black text-white mb-6 uppercase tracking-tight">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Rankings</span>
        </h1>
        <p className="font-mono text-zinc-400 max-w-2xl mx-auto leading-relaxed text-sm uppercase tracking-widest">
          The ultimate intellectual battleground. Defeat opponents, ascend the Elo ladder, and claim your place among the Grandmasters.
        </p>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)
        ) : users.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border-white/5">
             <Target size={48} className="mx-auto text-zinc-600 mb-4" />
             <h3 className="text-xl font-heading font-bold text-white mb-2 uppercase">No Combatants Ranked</h3>
             <p className="text-zinc-500 font-mono text-sm">Be the first to enter the arena and establish a rating.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {/* Table Header */}
            <div className="hidden md:flex px-8 py-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
               <div className="w-16">Rank</div>
               <div className="flex-1">Combatant</div>
               <div className="w-48 text-right">Telemetry</div>
               <div className="w-32 text-right">Rating</div>
            </div>

            {users.map((user, index) => {
              const style = getRankStyle(index);
              const isTop3 = index < 3;
              
              return (
                <motion.div key={user._id} variants={itemVariants}>
                  <Card className={`bg-surface border relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${style.border} ${style.glow}`}>
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    {/* Top 3 Background Highlights */}
                    {isTop3 && <div className={`absolute top-0 right-0 w-64 h-full ${style.bg} blur-3xl opacity-50 pointer-events-none`}></div>}

                    <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 relative z-10">
                      {/* Rank Number */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-black text-xl shrink-0 border ${style.border} ${style.bg} ${style.text}`}>
                        {index + 1}
                      </div>
                      
                      {/* Avatar */}
                      <div className="relative hidden sm:block shrink-0">
                         {isTop3 && <div className={`absolute -inset-1 rounded-full ${style.bg} animate-pulse blur-sm`}></div>}
                         <Avatar name={user.username} className={`w-14 h-14 border-2 relative z-10 ${style.border}`} />
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-heading font-bold text-lg sm:text-xl truncate flex items-center gap-3 ${isTop3 ? 'text-white' : 'text-zinc-300'}`}>
                          {user.username}
                          {index === 0 && <Medal className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />}
                          {index === 1 && <Medal className="w-5 h-5 text-zinc-300" />}
                          {index === 2 && <Medal className="w-5 h-5 text-amber-500" />}
                        </h3>
                        
                        {/* Mobile Telemetry */}
                        <div className="md:hidden flex items-center gap-4 mt-2 font-mono text-xs text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-emerald-500" /> 
                            <span className="text-white">{user.wins}</span>W - <span className="text-zinc-400">{user.losses}</span>L
                          </span>
                          {user.currentStreak > 2 && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Flame size={12} /> {user.currentStreak}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Desktop Telemetry */}
                      <div className="hidden md:flex flex-col items-end justify-center w-48 shrink-0 gap-2 font-mono text-xs text-zinc-500">
                          <span className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-500" /> 
                            <span className="text-white">{user.wins}</span> Wins / <span className="text-zinc-400">{user.losses}</span> Losses
                          </span>
                          {user.currentStreak > 2 ? (
                            <span className="flex items-center gap-1 text-orange-500 font-semibold shadow-sm">
                              <Flame size={14} className="animate-pulse" /> {user.currentStreak} Win Streak
                            </span>
                          ) : (
                            <span className="text-zinc-600">No Streak</span>
                          )}
                      </div>

                      {/* Rating & Badge */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-2 w-24 sm:w-32">
                        <div className={`text-2xl sm:text-3xl font-black font-heading tracking-tight ${isTop3 ? style.text : 'text-white'}`}>
                          {user.eloRating}
                        </div>
                        <Badge variant="outline" className={`py-0 text-[10px] font-mono uppercase tracking-widest border ${getRankBadge(user.rank)}`}>
                          {user.rank}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
