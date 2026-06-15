import User from '../models/User.js';

/**
 * Get global leaderboard (Top 100 users by Elo Rating)
 * GET /api/users/leaderboard
 */
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ eloRating: -1, wins: -1 })
      .limit(100)
      .select('username eloRating rank wins losses draws currentStreak highestStreak achievements');

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching leaderboard' });
  }
};

/**
 * Get analytics for the current user
 * GET /api/users/me/analytics
 */
export const getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalDebates = user.wins + user.losses + user.draws;
    const winRate = totalDebates > 0 ? Math.round((user.wins / totalDebates) * 100) : 0;

    res.json({
      eloRating: user.eloRating,
      rank: user.rank,
      totalDebates,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      winRate,
      currentStreak: user.currentStreak,
      highestStreak: user.highestStreak,
      achievements: user.achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching analytics' });
  }
};
