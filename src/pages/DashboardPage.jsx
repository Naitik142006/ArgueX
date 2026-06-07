import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Plus, History, Trophy, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserDebates } from '../services/debateService.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDebates = async () => {
      try {
        const data = await fetchUserDebates();
        setDebates(data);
      } catch (error) {
        console.error('Failed to load debates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDebates();
  }, []);

  const stats = [
    { label: 'Total Debates', value: debates.length, icon: Swords, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Win Rate', value: '0%', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Current Streak', value: '0', icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Global Rank', value: 'Unranked', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white">
            Welcome back, {user?.username}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Ready to test your logic today?
          </p>
        </div>
        <Link to="/debate">
          <Button variant="brand" icon={<Plus size={18} />}>
            New Debate
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main Content: Recent Debates */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <History size={20} className="text-zinc-400" />
              Recent Debates
            </h2>
            <Link to="/profile" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : debates.length === 0 ? (
              <EmptyState
                icon={Swords}
                title="No debates yet"
                description="Start your first AI debate session to build your critical thinking skills."
                action={
                  <Link to="/debate">
                    <Button variant="primary">Start First Debate</Button>
                  </Link>
                }
              />
            ) : (
              debates.map((debate, i) => (
                <motion.div
                  key={debate._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    interactive 
                    padding="p-5"
                    onClick={() => navigate(`/debate/${debate._id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="ai">ArgueX AI Coach</Badge>
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            &bull; {new Date(debate.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white truncate">
                          {debate.topic}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">{debate.messages?.length || 0}</p>
                          <p className="text-xs text-zinc-500">messages</p>
                        </div>
                        <ChevronRight className="text-zinc-300 dark:text-zinc-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-heading font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              Top Topics
            </h3>
            <div className="space-y-3">
              {[
                "Is AI conscious?",
                "Universal Basic Income",
                "Space Exploration vs Earth",
                "Social Media Regulation"
              ].map((topic, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm text-zinc-700 dark:text-zinc-300 font-medium"
                >
                  {topic}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
