/**
 * Sentiment Analysis Service
 * 
 * Analyzes debate messages for sentiment and emotion
 * Uses simple NLP rules (can be upgraded to ML model later)
 */

// Sentiment keywords
const SENTIMENT_KEYWORDS = {
  POSITIVE: {
    words: ['good', 'great', 'excellent', 'agree', 'correct', 'valid', 'strong', 'smart', 'brilliant', 'well', 'perfect', 'amazing', 'wonderful'],
    multiplier: 1,
  },
  NEGATIVE: {
    words: ['bad', 'wrong', 'false', 'incorrect', 'disagree', 'terrible', 'awful', 'stupid', 'ridiculous', 'nonsense', 'fail', 'failed', 'broken'],
    multiplier: -1,
  },
  NEUTRAL: {
    words: ['maybe', 'perhaps', 'somewhat', 'consider', 'think', 'believe', 'question'],
    multiplier: 0,
  },
};

// Emotion keywords
const EMOTION_KEYWORDS = {
  ASSERTIVE: ['must', 'should', 'will', 'definitely', 'clearly', 'obviously', 'absolutely'],
  CURIOUS: ['why', 'how', 'what', 'question', 'wondering', 'curious', 'consider', 'explore'],
  CONCERNED: ['risk', 'danger', 'problem', 'issue', 'worry', 'concerned', 'afraid', 'cautious'],
  SUPPORTIVE: ['agree', 'support', 'help', 'good', 'great', 'appreciate', 'thank', 'valid'],
  CRITICAL: ['disagree', 'wrong', 'bad', 'false', 'mistake', 'error', 'problem', 'contradiction'],
};

// Intensifiers and modifiers
const INTENSIFIERS = {
  'very': 1.5,
  'extremely': 2,
  'absolutely': 2,
  'completely': 1.5,
  'totally': 1.5,
  'really': 1.2,
};

const NEGATIONS = ['not', 'no', 'never', 'neither', "don't", "doesn't", "didn't", "can't", "won't"];

/**
 * Analyze sentiment of a message
 * 
 * @param {string} text - Message text
 * @returns {object} Sentiment analysis result
 */
export const analyzeSentiment = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      label: 'NEUTRAL',
      score: 0,
      confidence: 0,
      emotion: 'NEUTRAL',
    };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let sentimentScore = 0;
  let sentimentCount = 0;
  let emotionScores = {
    ASSERTIVE: 0,
    CURIOUS: 0,
    CONCERNED: 0,
    SUPPORTIVE: 0,
    CRITICAL: 0,
    NEUTRAL: 0,
  };

  // Check for negation before sentiment words
  let lastNegation = -3; // Start at -3 so first word is never negated
  let lastIntensifier = 1;

  words.forEach((word, index) => {
    // Check for negations
    if (NEGATIONS.includes(word)) {
      lastNegation = index;
    }

    // Check for intensifiers
    if (INTENSIFIERS[word]) {
      lastIntensifier = INTENSIFIERS[word];
    }

    // Check sentiment keywords
    Object.entries(SENTIMENT_KEYWORDS).forEach(([sentiment, data]) => {
      if (data.words.includes(word)) {
        let score = data.multiplier;

        // Apply negation (if within 2 words)
        if (index - lastNegation <= 2) {
          score *= -1;
        }

        // Apply intensifier
        score *= lastIntensifier;

        sentimentScore += score;
        sentimentCount++;

        // Update emotion scores
        if (sentiment === 'POSITIVE') {
          emotionScores.SUPPORTIVE += score;
        } else if (sentiment === 'NEGATIVE') {
          emotionScores.CRITICAL += score;
        }
      }
    });

    // Reset intensifier for each word
    if (!INTENSIFIERS[word]) {
      lastIntensifier = 1;
    }
  });

  // Check emotion keywords
  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        emotionScores[emotion]++;
      }
    });
  });

  // Calculate normalized sentiment score (-1 to 1)
  let finalScore = 0;
  if (sentimentCount > 0) {
    finalScore = sentimentScore / (sentimentCount * 2); // Normalize
    finalScore = Math.max(-1, Math.min(1, finalScore)); // Clamp to [-1, 1]
  }

  // Determine sentiment label
  let label = 'NEUTRAL';
  if (finalScore > 0.2) {
    label = 'POSITIVE';
  } else if (finalScore < -0.2) {
    label = 'NEGATIVE';
  }

  // Calculate confidence (based on keyword matches)
  const confidence = Math.min(1, sentimentCount / 5); // Max confidence at 5 keywords

  // Determine primary emotion
  const dominantEmotion = Object.entries(emotionScores)
    .reduce((max, [emotion, score]) => score > emotionScores[max] ? emotion : max);

  return {
    label,
    score: Math.round(finalScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    emotion: dominantEmotion,
  };
};

/**
 * Analyze multiple messages (e.g., for debate statistics)
 * 
 * @param {array} messages - Array of message texts
 * @returns {object} Aggregated sentiment analysis
 */
export const analyzeDebateSentiment = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      averageScore: 0,
      dominantSentiment: 'NEUTRAL',
      sentimentDistribution: {
        POSITIVE: 0,
        NEGATIVE: 0,
        NEUTRAL: 100,
      },
    };
  }

  const analyses = messages.map(msg => analyzeSentiment(msg.message || ''));

  const averageScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
  
  const distribution = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
  analyses.forEach(a => {
    distribution[a.label]++;
  });

  Object.keys(distribution).forEach(key => {
    distribution[key] = Math.round((distribution[key] / analyses.length) * 100);
  });

  const dominantSentiment = Object.entries(distribution)
    .reduce((max, [sentiment, count]) => count > distribution[max] ? sentiment : max);

  return {
    averageScore: Math.round(averageScore * 100) / 100,
    dominantSentiment,
    sentimentDistribution: distribution,
    emotionAnalysis: analyses.reduce((acc, a) => {
      acc[a.emotion] = (acc[a.emotion] || 0) + 1;
      return acc;
    }, {}),
  };
};

/**
 * Get sentiment trend (improving or declining)
 * 
 * @param {array} messages - Array of message texts (in chronological order)
 * @returns {string} Trend: 'improving', 'declining', or 'stable'
 */
export const getSentimentTrend = (messages) => {
  if (messages.length < 2) return 'stable';

  const midpoint = Math.floor(messages.length / 2);
  const firstHalf = messages.slice(0, midpoint);
  const secondHalf = messages.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, m) => sum + analyzeSentiment(m.message || '').score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + analyzeSentiment(m.message || '').score, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 0.1) return 'improving';
  if (difference < -0.1) return 'declining';
  return 'stable';
};

export default {
  analyzeSentiment,
  analyzeDebateSentiment,
  getSentimentTrend,
};
