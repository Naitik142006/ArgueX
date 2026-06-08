import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Medal, Flame } from 'lucide-react';
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

  const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    if (index === 1) return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    if (index === 2) return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
    return 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-transparent';
  };

  const getRankBadge = (rank) => {
    const colors = {
      Bronze: 'bg-orange-900/20 text-orange-700 dark:text-orange-400',
      Silver: 'bg-zinc-400/20 text-zinc-600 dark:text-zinc-300',
      Gold: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
      Platinum: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
      Diamond: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      Master: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      Grandmaster: 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
    };
    return colors[rank] || colors.Bronze;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-6">
          <Trophy size={32} />
        </div>
        <h1 className="text-4xl font-heading font-bold text-zinc-900 dark:text-white mb-4">
          Global Leaderboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          The top debaters on ArgueX. Win debates, increase your Elo rating, and climb the ranks to become a Grandmaster.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No ranked users yet. Be the first to win a debate!</div>
        ) : (
          users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border ${index < 3 ? getRankColor(index) : 'border-zinc-200 dark:border-zinc-800'} overflow-hidden relative group hover:border-brand-500/50 transition-colors`}>
                <div className="flex items-center gap-4 sm:gap-6 p-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 ${getRankColor(index)}`}>
                    #{index + 1}
                  </div>
                  
                  <Avatar name={user.username} className="w-12 h-12 hidden sm:flex shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-white truncate flex items-center gap-2">
                      {user.username}
                      {index === 0 && <Medal className="w-4 h-4 text-yellow-500" />}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {user.wins}W - {user.losses}L
                      </span>
                      {user.currentStreak > 2 && (
                        <span className="flex items-center gap-1 text-rose-500 font-medium">
                          <Flame className="w-3 h-3" /> {user.currentStreak} Streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-heading">
                      {user.eloRating}
                    </div>
                    <Badge className={getRankBadge(user.rank)}>{user.rank}</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
