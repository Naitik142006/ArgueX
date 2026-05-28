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

  debate.messages.push({ sender: 'User', text });
  await debate.save();

  res.status(201).json(debate);
};
