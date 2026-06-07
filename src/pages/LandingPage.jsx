import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, BrainCircuit, Trophy, Users, ArrowRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-500/20 dark:bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="brand" className="mb-6 px-3 py-1 rounded-full text-sm">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="fill-brand-500" />
                ArgueX Phase 6 is Live
              </span>
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8 text-balance">
              Where ideas are <br className="hidden sm:block" />
              <span className="gradient-text">sharpened by AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto text-balance">
              Challenge brilliant AI personas, refine your critical thinking, and climb the global leaderboards in the world's most advanced debate arena.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="xl" variant="brand" iconRight={<ArrowRight size={18} />} className="w-full">
                  Start Debating Free
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="xl" variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
              Join 2,000+ debaters improving their arguments daily.
            </p>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-24 sm:mt-32 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              title: 'AI Debate Coaches',
              desc: 'Debate against specialized AI personas like the Socratic Tutor or the Tech CEO to pressure-test your ideas.',
              icon: BrainCircuit,
              color: 'text-brand-500',
              bg: 'bg-brand-500/10'
            },
            {
              title: 'Real-Time Analytics',
              desc: 'Get instant feedback on your argument strength, logical fallacies, and emotional sentiment.',
              icon: Swords,
              color: 'text-rose-500',
              bg: 'bg-rose-500/10'
            },
            {
              title: 'Global Leaderboards',
              desc: 'Win debates, earn achievements, and see how you rank against top critical thinkers worldwide.',
              icon: Trophy,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              className="glass p-8 rounded-3xl hover:shadow-card-hover transition-shadow duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* Bottom CTA */}
      <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
            Ready to test your logic?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Create an account in 10 seconds and start your first debate against the ArgueX Coach.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="primary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
