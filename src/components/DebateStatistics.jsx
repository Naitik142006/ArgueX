import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Smile, Users, ThumbsUp, Activity, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import Card from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';

export default function DebateStatistics({ roomId, socket, currentUser, apiPath = '/api/debates' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!roomId) return;

    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiPath}/${roomId}/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.statistics);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    if (socket) {
      socket.on('statisticsUpdated', (newStats) => setStats(newStats));
      return () => socket.off('statisticsUpdated');
    }
  }, [roomId, socket, apiPath]);

  if (loading) {
    return (
      <Card className="animate-pulse p-6">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />)}
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sentiment', label: 'Sentiment', icon: Smile },
    { id: 'engagement', label: 'Engagement', icon: Users },
    { id: 'reactions', label: 'Reactions', icon: ThumbsUp },
  ];

  const StatBox = ({ label, value, icon: Icon, color = 'text-brand-500', bg = 'bg-brand-500/10' }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden bg-zinc-50 dark:bg-zinc-950/50">
      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-zinc-200 dark:border-zinc-800 px-2 pt-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap
              ${activeTab === tab.id ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox label="Messages" value={stats.messageCount || 0} icon={MessageSquare} />
                <StatBox label="Participants" value={stats.participantCount || 0} icon={Users} color="text-amber-500" bg="bg-amber-500/10" />
                <StatBox label="Duration" value={stats.duration ? `${stats.duration}m` : 'Ongoing'} icon={Clock} color="text-emerald-500" bg="bg-emerald-500/10" />
                <StatBox label="Avg Length" value={stats.averageMessageLength ? Math.round(stats.averageMessageLength) : 0} icon={Activity} color="text-purple-500" bg="bg-purple-500/10" />
              </div>
            )}

            {activeTab === 'sentiment' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Overall Score</p>
                  <p className="text-4xl font-heading font-bold text-zinc-900 dark:text-white mb-2">
                    {stats.averageSentimentScore?.toFixed(2) || 0}
                  </p>
                  <Badge variant={stats.averageSentimentScore > 0 ? 'success' : stats.averageSentimentScore < 0 ? 'danger' : 'default'}>
                    {stats.dominantSentiment || 'Neutral'}
                  </Badge>
                </div>
                
                {stats.sentimentDistribution && (
                  <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-center">
                    {[
                      { label: 'Positive', key: 'POSITIVE', color: 'bg-emerald-500' },
                      { label: 'Neutral', key: 'NEUTRAL', color: 'bg-zinc-500' },
                      { label: 'Negative', key: 'NEGATIVE', color: 'bg-rose-500' },
                    ].map(item => (
                      <div key={item.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                          <span className="text-zinc-500">{stats.sentimentDistribution[item.key] || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${stats.sentimentDistribution[item.key] || 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'engagement' && (
              <div className="space-y-3">
                {stats.participantStats?.length > 0 ? (
                  stats.participantStats.map((p, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-zinc-900 dark:text-white">{p.user}</span>
                        <Badge variant="brand" size="xs">{p.messageCount} messages</Badge>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-500 to-accent-500" 
                          style={{ width: `${(p.messageCount / (stats.messageCount || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-zinc-500">No engagement data</p>
                )}
              </div>
            )}

            {activeTab === 'reactions' && (
              <div className="flex flex-wrap gap-3">
                {stats.topReactions && Object.keys(stats.topReactions).length > 0 ? (
                  Object.entries(stats.topReactions).sort((a,b) => b[1] - a[1]).map(([emoji, count]) => (
                    <div key={emoji} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Reactions</span>
                        <span className="font-bold text-zinc-900 dark:text-white leading-none">{count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center w-full text-sm text-zinc-500">No reactions yet</p>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
