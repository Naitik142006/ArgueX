import Debate from '../models/Debate.js';

export const getDebates = async (req, res) => {
  const debates = await Debate.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(debates);
};

export const getDebateById = async (req, res) => {
  const debate = await Debate.findById(req.params.id);
  if (!debate) {
    res.status(404);
    throw new Error('Debate not found');
  }
  if (debate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this debate');
  }
  res.json(debate);
};

export const createDebate = async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    res.status(400);
    throw new Error('Topic is required');
  }

  const debate = await Debate.create({
    user: req.user._id,
    topic,
    messages: [
      {
        sender: 'AI',
        text: `Welcome to ArgueX. Start your debate on “${topic}” with your first message.`,
      },
    ],
  });

  res.status(201).json(debate);
};

export const addMessage = async (req, res) => {
  const debate = await Debate.findById(req.params.id);
  if (!debate) {
    res.status(404);
    throw new Error('Debate not found');
  }

  if (debate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to add message to this debate');
  }

  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error('Message text is required');
  }

  const username = req.user.username || req.user.name || 'User';
  debate.messages.push({ sender: username, text });
  await debate.save();

  res.status(201).json(debate);
};

export const getDebateStatistics = async (req, res) => {
  const debate = await Debate.findById(req.params.id);
  if (!debate) {
    res.status(404);
    throw new Error('Debate not found');
  }

  const username = req.user.username || 'User';
  const userMessages = debate.messages.filter(m => m.sender === 'User');
  const aiMessages = debate.messages.filter(m => m.sender === 'AI');
  const duration = debate.createdAt ? Math.round((new Date() - new Date(debate.createdAt)) / 60000) : 0;

  res.json({
    success: true,
    statistics: {
      messageCount: debate.messages.length,
      participantCount: 2,
      duration: duration,
      rootMessages: debate.messages.length,
      threads: 0,
      topReactions: {},
      totalReactions: 0,
      pinnedMessages: [],
      mostEmotionalMessages: [],
      participantStats: [
        {
          user: username,
          messageCount: userMessages.length,
          averageLength: userMessages.length > 0 ? Math.round(userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length) : 0,
          reactionsReceived: 0,
          sentiment: 0,
        },
        {
          user: 'AI Coach',
          messageCount: aiMessages.length,
          averageLength: aiMessages.length > 0 ? Math.round(aiMessages.reduce((sum, m) => sum + m.text.length, 0) / aiMessages.length) : 0,
          reactionsReceived: 0,
          sentiment: 0,
        }
      ]
    }
  });
};

/**
 * Evaluate a multiplayer group debate
 * @route POST /api/debates/group/evaluate
 */
export const evaluateGroup = async (req, res) => {
  const { roomId, chatMessages } = req.body;
  if (!roomId) {
    return res.status(400).json({ message: 'roomId is required' });
  }

  const messages = chatMessages && chatMessages.length > 0 
    ? chatMessages 
    : (global.multiplayerTranscripts ? global.multiplayerTranscripts.get(roomId) : null);
  if (!messages || messages.length === 0) {
    return res.status(400).json({ message: 'No transcript found for this room' });
  }

  try {
    const { aiService } = await import('../services/aiService.js');
    const evaluation = await aiService.evaluateGroupDebate(messages);

    // Save to DB (optional, since it's an ephemeral room we might just return it)
    res.json(evaluation);
  } catch (error) {
    console.error('evaluateGroup error:', error);
    res.status(500).json({ message: 'Failed to evaluate group debate' });
  }
};
