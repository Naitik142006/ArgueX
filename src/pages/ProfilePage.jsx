import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Calendar, Trophy, Swords, Medal, Star, Target } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function ProfilePage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Debates', value: 28, icon: Swords, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Wins', value: 18, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Losses', value: 8, icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Achievements', value: 6, icon: Medal, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card padding="p-8 sm:p-10" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-600 to-accent-600" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-12">
            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-xl">
              <Avatar name={user?.username} size="2xl" />
            </div>
            
            <div className="text-center sm:text-left flex-1 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white">
                  {user?.username}
                </h1>
                <Badge variant="brand" dot className="mx-auto sm:mx-0">
                  Pro Debater
                </Badge>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
                <Calendar size={16} />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="text-center">
              <div className={`mx-auto w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-lg font-heading font-semibold text-zinc-900 dark:text-white mb-6">
              Performance Overview
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Win Rate</span>
                  <span className="text-zinc-500">69%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[69%]" />
                  <div className="h-full bg-rose-500 w-[31%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Logic Score</span>
                  <span className="text-zinc-500">8.4 / 10</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 w-[84%]" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-heading font-semibold text-zinc-900 dark:text-white mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-4">
              {[
                { title: 'First Blood', desc: 'Won your first debate', icon: Star, color: 'text-amber-500' },
                { title: 'Logician', desc: 'Used 0 logical fallacies', icon: BrainCircuit, color: 'text-brand-500' },
              ].map((ach, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className={`p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ${ach.color}`}>
                    <ach.icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{ach.title}</p>
                    <p className="text-sm text-zinc-500">{ach.desc}</p>
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

// Temporary mock icon for achievements
function BrainCircuit(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M12 13h4" />
      <path d="M12 18h6a2 2 0 0 1 2 2v1" />
      <path d="M12 8h8" />
      <path d="M16 8V5a2 2 0 0 1 2-2" />
      <circle cx="16" cy="13" r=".5" />
      <circle cx="18" cy="3" r=".5" />
      <circle cx="20" cy="21" r=".5" />
      <circle cx="20" cy="8" r=".5" />
    </svg>
  );
}
