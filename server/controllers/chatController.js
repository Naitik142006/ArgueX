import asyncHandler from '../middleware/asyncHandler.js';
import DebateRoom from '../models/DebateRoom.js';
import User from '../models/User.js';
import { analyzeSentiment } from '../services/sentimentService.js';

/**
 * Enhanced Chat Controller
 * 
 * Handles:
 * - Reactions to messages
 * - Message editing
 * - Threaded replies
 * - Message deletion
 * - Message pinning
 * - Sentiment analysis
 */

/**
 * Add reaction to a message
 * 
 * FLOW:
 * socket.emit('addReaction', { messageId, reaction })
 *   ↓
 * Server finds message + adds user to reaction array
 *   ↓
 * io.to(room).emit('reactionAdded', { messageId, reaction, count })
 *   ↓
 * All clients update message with new reaction
 */
export const addReaction = asyncHandler(async (req, res) => {
  const { roomId, messageId, reaction } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.addReaction(messageId, reaction, userId);

    const message = room.messages.find(m => m._id.toString() === messageId.toString());

    res.status(200).json({
      success: true,
      message: 'Reaction added',
      reaction: {
        messageId,
        reaction,
        count: message.reactionCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reaction', error: error.message });
  }
});

/**
 * Remove reaction from message
 */
export const removeReaction = asyncHandler(async (req, res) => {
  const { roomId, messageId, reaction } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.removeReaction(messageId, reaction, userId);

    res.status(200).json({
      success: true,
      message: 'Reaction removed',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing reaction', error: error.message });
  }
});

/**
 * Edit message
 * 
 * Only author or room creator can edit
 * Records edit history
 * Updates sentiment analysis
 */
export const editMessage = asyncHandler(async (req, res) => {
  const { roomId, messageId, newMessage } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.editMessage(messageId, newMessage, userId);

    const message = room.messages.find(m => m._id.toString() === messageId.toString());

    // Re-analyze sentiment
    message.sentiment = analyzeSentiment(newMessage);
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Message edited',
      editedMessage: {
        messageId,
        message: newMessage,
        sentiment: message.sentiment,
        isEdited: true,
        lastEditedAt: message.lastEditedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error editing message', error: error.message });
  }
});

/**
 * Delete message
 * 
 * Only author or room creator can delete
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { roomId, messageId } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.deleteMessage(messageId, userId);

    res.status(200).json({
      success: true,
      message: 'Message deleted',
      messageId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

/**
 * Pin message (mark as important)
 * 
 * Only room creator can pin messages
 */
export const pinMessage = asyncHandler(async (req, res) => {
  const { roomId, messageId } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check authorization (creator only)
    if (room.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only room creator can pin messages' });
    }

    await room.pinMessage(messageId, userId);

    res.status(200).json({
      success: true,
      message: 'Message pinned',
      messageId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error pinning message', error: error.message });
  }
});

/**
 * Unpin message
 */
export const unpinMessage = asyncHandler(async (req, res) => {
  const { roomId, messageId } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check authorization
    if (room.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only room creator can unpin messages' });
    }

    await room.unpinMessage(messageId);

    res.status(200).json({
      success: true,
      message: 'Message unpinned',
      messageId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unpinning message', error: error.message });
  }
});

/**
 * Get debate statistics
 * 
 * Returns:
 * - Message metrics
 * - Sentiment analysis
 * - Reaction statistics
 * - Top messages
 * - Debate timeline
 */
export const getDebateStatistics = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await DebateRoom.findOne({ roomId })
      .populate('participants.user', 'username');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Calculate fresh statistics
    room.calculateStatistics();

    // Get pinned messages
    const pinnedMessages = room.messages.filter(m => m.isPinned);

    // Get top reactions
    const topReactions = {};
    room.messages.forEach(m => {
      if (m.reactions) {
        m.reactions.forEach((users, emoji) => {
          topReactions[emoji] = (topReactions[emoji] || 0) + users.length;
        });
      }
    });

    // Get threaded replies
    const threads = room.messages.filter(m => m.parentId);
    const rootMessages = room.messages.filter(m => !m.parentId);

    // Get most emotional messages
    const emotionalMessages = room.messages
      .sort((a, b) => (b.sentiment?.confidence || 0) - (a.sentiment?.confidence || 0))
      .slice(0, 5);

    // Participant stats
    const participantStats = room.participants.map(p => {
      const messagesByUser = room.messages.filter(m => m.userId.equals(p.user._id));
      const reactionsReceived = messagesByUser.reduce((sum, m) => sum + (m.reactionCount || 0), 0);
      
      return {
        user: p.user.username,
        messageCount: messagesByUser.length,
        averageLength: messagesByUser.length > 0
          ? Math.round(messagesByUser.reduce((sum, m) => sum + (m.message?.length || 0), 0) / messagesByUser.length)
          : 0,
        reactionsReceived,
        sentiment: messagesByUser.length > 0
          ? Math.round(messagesByUser.reduce((sum, m) => sum + (m.sentiment?.score || 0), 0) / messagesByUser.length * 100) / 100
          : 0,
      };
    });

    res.status(200).json({
      success: true,
      statistics: {
        // Overall metrics
        messageCount: room.messageCount,
        participantCount: room.participants.filter(p => p.status === 'active').length,
        duration: room.endedAt ? Math.round((room.endedAt - room.startedAt) / 60000) : null,
        
        // Debate statistics
        ...room.statistics,
        
        // Messages
        rootMessages: rootMessages.length,
        threads: threads.length,
        
        // Reactions
        topReactions: topReactions,
        totalReactions: Object.values(topReactions).reduce((a, b) => a + b, 0),
        
        // Content
        pinnedMessages: pinnedMessages.map(m => ({
          id: m._id,
          author: m.userName,
          message: m.message,
          reactions: m.reactionCount,
          createdAt: m.createdAt,
        })),
        
        // Analysis
        mostEmotionalMessages: emotionalMessages.map(m => ({
          id: m._id,
          author: m.userName,
          message: m.message,
          sentiment: m.sentiment,
        })),
        
        // Per-participant stats
        participantStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

/**
 * Get pinned messages for a room
 */
export const getPinnedMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const pinnedMessages = room.messages
      .filter(m => m.isPinned)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      pinnedMessages: pinnedMessages.map(m => ({
        id: m._id,
        author: m.userName,
        message: m.message,
        sentiment: m.sentiment,
        reactions: m.reactionCount,
        pinnedAt: m.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pinned messages', error: error.message });
  }
});

/**
 * Get thread (replies to a message)
 */
export const getThread = asyncHandler(async (req, res) => {
  const { roomId, messageId } = req.params;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const parent = room.messages.find(m => m._id.toString() === messageId.toString());

    if (!parent) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const replies = room.messages.filter(m => m.parentId && m.parentId.toString() === messageId.toString());

    res.status(200).json({
      success: true,
      thread: {
        parent: {
          id: parent._id,
          author: parent.userName,
          message: parent.message,
          sentiment: parent.sentiment,
          reactions: parent.reactionCount,
          createdAt: parent.createdAt,
        },
        replies: replies.map(r => ({
          id: r._id,
          author: r.userName,
          message: r.message,
          sentiment: r.sentiment,
          reactions: r.reactionCount,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching thread', error: error.message });
  }
});

/**
 * Reply to a message (threaded)
 * 
 * Called by Socket.IO handler
 */
export const replyToMessage = asyncHandler(async (req, res) => {
  const { roomId, parentId, message, position } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get user info
    const user = await User.findById(userId);

    // Add message as reply (with parentId)
    await room.addMessage(userId, user.username, message, position, parentId);

    // Analyze sentiment
    const newMessage = room.messages[room.messages.length - 1];
    newMessage.sentiment = analyzeSentiment(message);
    await room.save();

    res.status(201).json({
      success: true,
      message: {
        id: newMessage._id,
        userId,
        userName: user.username,
        message,
        position,
        parentId,
        sentiment: newMessage.sentiment,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error replying to message', error: error.message });
  }
});
