import Debate from '../models/Debate.js';
import User from '../models/User.js';
import { aiService } from '../services/aiService.js';
import { calculateNewRating, calculateStreaks, getRankTier } from '../services/eloService.js';

/**
 * Generate AI reply for a debate.
 * 
 * Flow:
 * 1. Find debate by ID.
 * 2. Verify user owns the debate.
 * 3. Extract chat history.
 * 4. Pass history and persona to aiService.
 * 5. Save AI response to debate messages.
 * 6. Return updated debate.
 */
export const generateReply = async (req, res) => {
  const { id } = req.params;

  const debate = await Debate.findById(id);
  
  if (!debate) {
    res.status(404);
    throw new Error('Debate not found');
  }

  // Security: Ensure the logged-in user owns this debate
  if (debate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this debate');
  }

  if (debate.status === 'completed') {
    res.status(400);
    throw new Error('Debate is already completed');
  }

  // Get the latest user message from the array
  const lastMessage = debate.messages[debate.messages.length - 1];
  
  // Call AI Service
  try {
    const aiResponseText = await aiService.generateDebateResponse(
      debate.messages,
      debate.aiPersona || 'coach',
      debate.topic,
      lastMessage.text
    );

    // Add AI response to the database
    const finalSender = (!debate.aiPersona || debate.aiPersona === 'coach' || debate.aiPersona === 'einstein') 
      ? 'ArgueX AI Coach' 
      : debate.aiPersona;

    debate.messages.push({
      sender: finalSender,
      text: aiResponseText
    });

    await debate.save();
    res.json(debate);
  } catch (error) {
    console.error('AI Service Error in generateReply:', error);
    res.status(503).json({ message: 'AI analysis is temporarily unavailable. Please try again later.' });
  }
};

/**
 * Analyze a completed debate and generate scores/fallacies.
 */
export const analyzeDebate = async (req, res) => {
  const { id } = req.params;
  const debate = await Debate.findById(id);

  if (!debate) {
    res.status(404);
    throw new Error('Debate not found');
  }

  if (debate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this debate');
  }

  // Call the AI Service to evaluate
  // We expect evaluateDebate to return a structured JSON object
  let analysis;
  try {
    analysis = await aiService.evaluateDebate(debate.messages);
  } catch (error) {
    console.error('AI Service Error in analyzeDebate:', error);
    return res.status(503).json({ message: 'AI analysis is temporarily unavailable. Please try again later.' });
  }

  const user = await User.findById(req.user._id);
  let eloChange = 0;

  if (user && analysis.winner) {
    // 1 for win, 0 for loss, 0.5 for draw
    let actualScore = 0.5;
    if (analysis.winner === 'user') actualScore = 1;
    if (analysis.winner === 'ai') actualScore = 0;

    // AI's baseline rating is assumed to be 1500 for now
    const ratingResult = calculateNewRating(user.eloRating || 1200, 1500, actualScore);
    eloChange = ratingResult.eloChange;
    
    user.eloRating = ratingResult.newRating;
    user.rank = getRankTier(user.eloRating);
    
    if (actualScore === 1) user.wins += 1;
    else if (actualScore === 0) user.losses += 1;
    else user.draws += 1;

    // Calculate streaks
    const streakResult = calculateStreaks(user.lastDebateDate, user.currentStreak || 0, user.highestStreak || 0);
    user.currentStreak = streakResult.currentStreak;
    user.highestStreak = streakResult.highestStreak;
    user.lastDebateDate = new Date();

    await user.save();
  }

  // Update debate status and save analysis
  debate.status = 'completed';
  debate.analysis = {
    ...analysis,
    eloChange
  };
  
  await debate.save();

  res.json(debate);
};

/**
 * Generate random debate topics based on category.
 */
export const getTopics = async (req, res) => {
  const { category } = req.body;
  try {
    const topics = await aiService.generateTopics(category || 'General');
    res.json({ topics });
  } catch (error) {
    console.error('AI Service Error in getTopics:', error);
    res.status(503).json({ message: 'AI analysis is temporarily unavailable. Please try again later.' });
  }
};
