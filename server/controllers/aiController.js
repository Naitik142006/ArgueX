import Debate from '../models/Debate.js';
import { aiService } from '../services/aiService.js';

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
  const analysis = await aiService.evaluateDebate(debate.messages);

  // Update debate status and save analysis
  debate.status = 'completed';
  debate.analysis = analysis;
  
  await debate.save();

  res.json(debate);
};

/**
 * Generate random debate topics based on category.
 */
export const getTopics = async (req, res) => {
  const { category } = req.body;
  const topics = await aiService.generateTopics(category || 'General');
  res.json({ topics });
};
