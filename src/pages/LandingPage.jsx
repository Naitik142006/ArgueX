import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swords, BrainCircuit, Trophy, Users, ArrowRight, Zap, Target, Activity, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative overflow-hidden bg-background min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pb-40 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl min-h-[90vh] flex flex-col justify-center">
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="text-center max-w-4xl mx-auto z-10 relative"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="flex justify-center mb-8">
              <Badge variant="neon" className="px-4 py-1.5 rounded-full text-sm shadow-neon-cyan animate-glow-pulse">
                <span className="flex items-center gap-2">
                  <Zap size={16} className="text-neon-cyan" />
                  Season 1 Global Ladder is Live
                </span>
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold tracking-tighter text-white mb-8 text-balance leading-[1.1]">
              The Ultimate <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-neon-cyan to-neon-violet">Intellectual Arena</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl sm:text-2xl text-zinc-400 font-medium mb-12 max-w-3xl mx-auto text-balance leading-relaxed">
              Step into the world's first competitive AI debate platform. Train against hyper-intelligent personas, climb the global Elo ladder, and prove your logic.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="xl" variant="brand" iconRight={<ArrowRight size={20} />} className="w-full sm:w-auto px-10 py-5 text-lg">
                  Enter The Arena
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full sm:w-auto px-10 py-5 text-lg group">
                  <span className="group-hover:text-white transition-colors">Sign In</span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero 3D/Floating Elements Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative max-w-5xl mx-auto w-full aspect-video rounded-3xl border border-white/10 glass-panel shadow-[0_0_80px_rgba(37,99,235,0.2)] overflow-hidden flex items-center justify-center bg-surface"
        >
           <div className="absolute inset-0 bg-grid-arena opacity-30"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
           
           {/* Mini Arena Mockup UI inside */}
           <div className="relative z-20 w-full h-full p-8 flex flex-col gap-4 opacity-90">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                       <Swords size={16} className="text-brand-400" />
                    </div>
                    <span className="font-heading font-bold text-white tracking-widest uppercase">Combat Simulation</span>
                 </div>
                 <div className="flex gap-2">
                    <Badge variant="neon" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1 text-[10px]">SECURE LINK</Badge>
                 </div>
              </div>
              
              {/* Main Split */}
              <div className="flex-1 flex gap-6 mt-2">
                 {/* Chat Area */}
                 <div className="flex-1 flex flex-col gap-4">
                    <div className="self-start max-w-[90%] p-4 rounded-2xl rounded-tl-sm bg-surface border border-white/5 shadow-glass">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-400">U</div>
                          <span className="text-xs font-mono font-bold text-zinc-300">You</span>
                          <span className="text-[10px] text-zinc-600">12:40 PM</span>
                       </div>
                       <p className="text-sm text-zinc-300 leading-relaxed font-medium">AI is good but is harming and making people dependent on it.</p>
                    </div>

                    <div className="self-end max-w-[90%] p-4 rounded-2xl rounded-tr-sm bg-surface border border-neon-cyan/20 shadow-neon-cyan">
                       <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                          <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                             <BrainCircuit size={12} className="text-neon-cyan" />
                          </div>
                          <span className="text-xs font-mono font-bold text-neon-cyan">ARGUS-V1 (AI)</span>
                          <span className="text-[10px] text-zinc-600">12:41 PM</span>
                       </div>
                       <p className="text-sm text-white leading-relaxed font-medium">While dependence is a risk, consider that AI acts as a cognitive amplifier rather than a replacement. The calculator didn't make humans worse at math; it elevated the baseline of what we could compute.</p>
                    </div>

                    {/* Input mock */}
                    <div className="mt-auto h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl flex items-center px-4 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 animate-pulse"></div>
                       <span className="text-sm text-zinc-500 font-mono ml-2">Construct your counter-argument...</span>
                    </div>
                 </div>

                 {/* Stats Sidebar */}
                 <div className="w-1/3 flex flex-col gap-4">
                    <div className="flex-1 bg-surface border border-white/10 rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-400/10 blur-[30px]"></div>
                        <Activity className="text-brand-400 mb-2" size={24} />
                        <div className="text-3xl font-bold text-white font-mono">92%</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Logic Score</div>
                    </div>
                    <div className="flex-1 bg-surface border border-white/10 rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-neon-violet/10 blur-[30px]"></div>
                        <Target className="text-neon-violet mb-2" size={24} />
                        <div className="text-3xl font-bold text-white font-mono">0</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Fallacies Found</div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">Designed for Champions</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">A feature suite built to analyze, improve, and broadcast your intellectual combat.</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              title: 'Ruthless AI Coaches',
              desc: 'Face off against advanced LLM personas trained in logic, rhetoric, and debate tactics.',
              icon: BrainCircuit,
              color: 'text-neon-cyan',
              shadow: 'shadow-neon-cyan'
            },
            {
              title: 'Live Logic Analysis',
              desc: 'Our AI judge analyzes your arguments in real-time, detecting fallacies and evaluating structure.',
              icon: Activity,
              color: 'text-brand-400',
              shadow: 'shadow-neon-blue'
            },
            {
              title: 'Competitive Ladder',
              desc: 'Start at Bronze and fight your way to Grandmaster. Every debate impacts your global Elo rating.',
              icon: Trophy,
              color: 'text-rank-gold',
              shadow: 'shadow-rank-gold'
            },
            {
              title: 'WebRTC Mesh Arenas',
              desc: 'Host 6-player video debates with zero latency using our peer-to-peer decentralized architecture.',
              icon: Users,
              color: 'text-neon-violet',
              shadow: 'shadow-neon-violet'
            },
            {
              title: 'Decentralized STT',
              desc: 'In-browser speech-to-text ensures lightning-fast, private transcription without server bottlenecks.',
              icon: ShieldAlert,
              color: 'text-emerald-400',
              shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]'
            },
            {
              title: 'Post-Match Replays',
              desc: 'Analyze past debates with comprehensive stat breakdowns, transcript reviews, and AI feedback.',
              icon: Target,
              color: 'text-rose-400',
              shadow: 'shadow-[0_0_15px_rgba(251,113,133,0.3)]'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300 group"
            >
              <div className={`w-14 h-14 rounded-xl bg-surface border border-white/10 ${feature.color} flex items-center justify-center mb-6 group-hover:${feature.shadow} transition-shadow duration-300`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- LEADERBOARD PREVIEW --- */}
      <section className="relative py-32 border-t border-white/5 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                 <Badge variant="gold" className="mb-6">Global Rankings</Badge>
                 <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">Prove Your Worth</h2>
                 <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                   The leaderboard isn't just a list—it's a testament to your logical prowess. Achieve the rank of Grandmaster to unlock exclusive tournaments and beta features.
                 </p>
                 <Link to="/leaderboard">
                   <Button variant="outline" iconRight={<ArrowRight size={18} />}>View Full Standings</Button>
                 </Link>
              </div>
              <div className="flex-1 w-full relative">
                 {/* Decorative background glow */}
                 <div className="absolute inset-0 bg-rank-gold/10 blur-[100px] rounded-full"></div>
                 
                 <div className="glass-panel p-6 relative z-10 flex flex-col gap-4">
                    {[
                      { rank: 1, name: 'Socrates_Reborn', elo: 2450, tier: 'Grandmaster', color: 'text-rank-grandmaster', bg: 'bg-rank-grandmaster/10' },
                      { rank: 2, name: 'LogicBomb', elo: 2310, tier: 'Master', color: 'text-rank-master', bg: 'bg-rank-master/10' },
                      { rank: 3, name: 'DebateKing99', elo: 2185, tier: 'Diamond', color: 'text-rank-diamond', bg: 'bg-rank-diamond/10' },
                    ].map((player) => (
                      <div key={player.rank} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-white/5 hover:border-white/10 transition-colors">
                         <div className="font-heading font-bold text-xl text-zinc-500 w-6">#{player.rank}</div>
                         <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold">{player.name[0]}</div>
                         <div className="flex-1">
                            <div className="font-heading font-bold text-white">{player.name}</div>
                            <div className={`text-xs font-mono font-semibold uppercase ${player.color}`}>{player.tier}</div>
                         </div>
                         <div className="font-mono font-bold text-brand-400">{player.elo}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="relative py-40 border-t border-white/5 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-brand-600/5 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/20 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-heading font-bold text-white mb-8">
            Ready to test your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-brand-400">Logic?</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12">
            Create an account in 10 seconds and step into the arena.
          </p>
          <Link to="/signup">
            <Button size="xl" variant="brand" className="px-12 py-6 text-xl shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
