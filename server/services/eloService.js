/**
 * Gamification & Ranking Engine
 * Calculates Elo ratings, determines rank tiers, and manages debate streaks.
 */

const K_FACTOR_NOVICE = 32;
const K_FACTOR_INTERMEDIATE = 24;
const K_FACTOR_MASTER = 16;

/**
 * Determine the appropriate K-factor based on current rating
 */
function getKFactor(rating) {
  if (rating < 1400) return K_FACTOR_NOVICE;
  if (rating < 2000) return K_FACTOR_INTERMEDIATE;
  return K_FACTOR_MASTER;
}

/**
 * Calculate the expected score (win probability) for player A
 * @param {number} ratingA - Player A's current rating
 * @param {number} ratingB - Player B's current rating (or AI's baseline rating)
 * @returns {number} expected score between 0.0 and 1.0
 */
export function getExpectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate the new rating for a player after a match
 * @param {number} currentRating - The player's current rating
 * @param {number} opponentRating - The opponent's rating
 * @param {number} actualScore - 1 for Win, 0 for Loss, 0.5 for Draw
 * @returns {object} { newRating, eloChange }
 */
export function calculateNewRating(currentRating, opponentRating, actualScore) {
  const expectedScore = getExpectedScore(currentRating, opponentRating);
  const kFactor = getKFactor(currentRating);
  
  const eloChange = Math.round(kFactor * (actualScore - expectedScore));
  const newRating = currentRating + eloChange;
  
  return {
    newRating: Math.max(0, newRating), // Rating cannot drop below 0
    eloChange
  };
}

/**
 * Get the rank tier name based on rating
 */
export function getRankTier(rating) {
  if (rating < 1100) return 'Bronze';
  if (rating < 1300) return 'Silver';
  if (rating < 1500) return 'Gold';
  if (rating < 1700) return 'Platinum';
  if (rating < 2000) return 'Diamond';
  if (rating < 2400) return 'Master';
  return 'Grandmaster';
}

/**
 * Update user streaks based on the last debate date
 * @param {Date} lastDebateDate - The date of the user's last debate
 * @param {number} currentStreak - The user's current streak
 * @param {number} highestStreak - The user's highest streak
 * @returns {object} { newCurrentStreak, newHighestStreak }
 */
export function calculateStreaks(lastDebateDate, currentStreak, highestStreak) {
  const now = new Date();
  
  if (!lastDebateDate) {
    return { currentStreak: 1, highestStreak: Math.max(1, highestStreak) };
  }

  const lastDate = new Date(lastDebateDate);
  // Reset hours to compare pure calendar days
  now.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newCurrentStreak = currentStreak;

  if (diffDays === 1) {
    // Debated yesterday, streak continues!
    newCurrentStreak += 1;
  } else if (diffDays > 1) {
    // Missed a day, streak broken!
    newCurrentStreak = 1;
  } else {
    // Already debated today, streak stays the same
    newCurrentStreak = currentStreak;
  }

  return {
    currentStreak: newCurrentStreak,
    highestStreak: Math.max(newCurrentStreak, highestStreak)
  };
}
