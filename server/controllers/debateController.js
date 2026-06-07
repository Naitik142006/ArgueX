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
