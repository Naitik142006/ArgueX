import asyncHandler from '../middleware/asyncHandler.js';
import Feedback from '../models/Feedback.js';

/**
 * Generate a reference ID like ARGX-FB-1024
 */
const generateReferenceId = async () => {
  const count = await Feedback.countDocuments();
  const base = 1000 + count;
  return `ARGX-FB-${base}`;
};

/**
 * @desc    Submit new feedback
 * @route   POST /api/feedback
 * @access  Private
 */
export const submitFeedback = asyncHandler(async (req, res) => {
  const { type, title, description, screenshotUrl, priority, page, browser, device } = req.body;
  
  if (!type || !title || !description) {
    res.status(400);
    throw new Error('Please provide all required fields: type, title, description');
  }

  const referenceId = await generateReferenceId();

  const feedback = await Feedback.create({
    user: req.user._id,
    username: req.user.username || req.user.name,
    referenceId,
    type,
    title,
    description,
    screenshotUrl,
    priority: priority || 'Low',
    page,
    browser,
    device,
    status: 'Open',
    upvotes: [req.user._id], // user automatically upvotes their own feedback
  });

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    feedback
  });
});

/**
 * @desc    Get all feedback (Admin only)
 * @route   GET /api/feedback
 * @access  Private/Admin
 */
export const getAllFeedback = asyncHandler(async (req, res) => {
  const { type, status, priority, search } = req.query;
  
  // Build query
  const query = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { referenceId: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: feedbacks.length,
    feedbacks
  });
});

/**
 * @desc    Update feedback status/priority (Admin only)
 * @route   PATCH /api/feedback/:id
 * @access  Private/Admin
 */
export const updateFeedback = asyncHandler(async (req, res) => {
  const { status, priority } = req.body;
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  if (status) feedback.status = status;
  if (priority) feedback.priority = priority;

  const updatedFeedback = await feedback.save();

  res.json({
    success: true,
    feedback: updatedFeedback
  });
});

/**
 * @desc    Upvote a feedback item
 * @route   PUT /api/feedback/:id/upvote
 * @access  Private
 */
export const upvoteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if user already upvoted
  const hasUpvoted = feedback.upvotes.includes(req.user._id);

  if (hasUpvoted) {
    // Remove upvote
    feedback.upvotes = feedback.upvotes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    // Add upvote
    feedback.upvotes.push(req.user._id);
  }

  await feedback.save();

  res.json({
    success: true,
    upvotes: feedback.upvotes.length,
    hasUpvoted: !hasUpvoted
  });
});
