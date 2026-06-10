import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Calendar, Trophy, Swords, Medal, Star, Target, BrainCircuit, Activity, ShieldAlert, Crosshair } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function ProfilePage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Battles Fought', value: 28, icon: Swords, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
    { label: 'Victories', value: 18, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]' },
    { label: 'Defeats', value: 8, icon: Target, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]' },
    { label: 'Accolades', value: 6, icon: Medal, color: 'text-neon-violet', bg: 'bg-neon-violet/10', border: 'border-neon-violet/20', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in relative">
      {/* Background Ambience */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-brand-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-8 relative z-10"
      >
        <Card padding="p-0" className="relative overflow-hidden glass-panel border-white/10 shadow-glass group">
          {/* Banner */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-brand-900 via-brand-800/50 to-background border-b border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-arena opacity-30"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
             {/* Neon Slash */}
             <div className="absolute top-0 right-1/4 w-32 h-[200%] bg-brand-400/20 rotate-45 blur-xl group-hover:bg-brand-400/30 transition-colors duration-500"></div>
          </div>
          
          <div className="relative z-10 p-6 sm:p-10 pt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            <div className="relative">
              <div className="absolute -inset-2 bg-brand-500/20 rounded-full blur-md animate-pulse"></div>
              <div className="p-1.5 bg-surface border border-white/10 rounded-full shadow-neon-blue relative z-10">
                <Avatar name={user?.username} size="2xl" className="border-2 border-white/5" />
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tight drop-shadow-md">
                  {user?.username}
                </h1>
                <Badge variant="neon" className="mx-auto sm:mx-0 py-0.5 shadow-neon-blue">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span> ACTIVE COMBATANT</span>
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-mono text-zinc-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Activity size={14} className="text-emerald-500" /> Online
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-zinc-500" />
                  Initiated {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end justify-center mb-2">
               <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Current Rating</span>
               <div className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 drop-shadow-sm">
                  1452
               </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10"
      >
        {stats.map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className={`text-center glass-panel border ${stat.border} ${stat.glow} group hover:-translate-y-1 transition-all duration-300`}>
              <div className={`mx-auto w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-5 border border-white/5 shadow-glass group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={26} />
              </div>
              <p className="text-4xl font-heading font-bold text-white mb-2 drop-shadow-sm">{stat.value}</p>
              <p className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          <Card className="glass-panel border-white/10 h-full shadow-glass relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors duration-500"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
                 <Activity size={20} />
               </div>
               <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wide">
                 Combat Telemetry
               </h3>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-mono text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Target size={14}/> Win Rate</span>
                  <span className="font-heading font-bold text-emerald-400 text-lg">69%</span>
                </div>
                <div className="h-3 w-full bg-surface border border-white/5 rounded-full overflow-hidden flex shadow-inner relative">
                  <div className="h-full bg-emerald-500 w-[69%] relative">
                     <div className="absolute inset-0 bg-white/20 w-full"></div>
                  </div>
                  <div className="h-full bg-rose-500 w-[31%] opacity-50" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-mono text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><BrainCircuit size={14}/> Logic Index</span>
                  <span className="font-heading font-bold text-brand-400 text-lg">8.4 <span className="text-zinc-500 text-sm">/ 10</span></span>
                </div>
                <div className="h-3 w-full bg-surface border border-white/5 rounded-full overflow-hidden shadow-inner relative">
                  <div className="h-full bg-gradient-to-r from-brand-600 to-neon-cyan w-[84%] relative">
                     <div className="absolute top-0 right-0 w-10 h-full bg-white/30 blur-sm"></div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-heading font-bold text-white">42</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Perfect Arguments</span>
                 </div>
                 <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-heading font-bold text-white">12</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Fallacies Detected</span>
                 </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
        >
          <Card className="glass-panel border-white/10 h-full shadow-glass">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                   <Medal size={20} />
                 </div>
                 <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wide">
                   Recent Accolades
                 </h3>
               </div>
               <Badge variant="outline" className="text-[10px] py-0 border-white/10 text-zinc-500">VIEW ALL</Badge>
            </div>
            
            <div className="space-y-3">
              {[
                { title: 'First Blood', desc: 'Secured first arena victory', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                { title: 'Logician', desc: 'Zero fallacies in a ranked match', icon: BrainCircuit, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
                { title: 'Sharpshooter', desc: 'Dismantled opponent in under 3 turns', icon: Crosshair, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
              ].map((ach, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 group">
                  <div className={`p-3 rounded-xl border shadow-sm group-hover:scale-110 transition-transform ${ach.bg} ${ach.color} ${ach.border}`}>
                    <ach.icon size={20} />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-white text-base tracking-wide uppercase">{ach.title}</p>
                    <p className="text-xs font-mono text-zinc-500">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
