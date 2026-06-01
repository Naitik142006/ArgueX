import asyncHandler from '../middleware/asyncHandler.js';
import DebateRoom from '../models/DebateRoom.js';
import Debate from '../models/Debate.js';
import User from '../models/User.js';

/**
 * Room Controller
 * 
 * Handles all room operations:
 * - Create room
 * - Join room
 * - Get room info
 * - Get messages
 * - Leave room
 * - End room
 */

/**
 * Create a new debate room
 * 
 * FLOW:
 * 1. User clicks "Start Live Debate" on debate page
 * 2. Frontend: POST /api/rooms/create { debateId, topic, position }
 * 3. Backend creates DebateRoom
 * 4. Socket.IO creates room
 * 5. Frontend joins room + connects Socket
 * 6. Room is ready for participants
 */
export const createRoom = asyncHandler(async (req, res) => {
  const { debateId, topic, position } = req.body;
  const userId = req.user.id;

  // Validate debate exists
  const debate = await Debate.findById(debateId);
  if (!debate) {
    return res.status(404).json({ message: 'Debate not found' });
  }

  // Ensure user owns the debate
  if (debate.user.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized to create room for this debate' });
  }

  try {
    // Create new room
    const room = await DebateRoom.create({
      debate: debateId,
      roomId: `debate_${debateId}_${Date.now()}`,
      creator: userId,
      topic: topic || debate.topic,
      position,
      status: 'waiting',
      maxParticipants: 2,
    });

    // Add creator as first participant
    await room.addParticipant(userId);

    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        debateId: room.debate,
        topic: room.topic,
        position: room.position,
        status: room.status,
        participants: room.participants,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

/**
 * Join an existing debate room
 * 
 * FLOW:
 * 1. User clicks "Join Debate"
 * 2. Frontend: POST /api/rooms/:roomId/join
 * 3. Backend checks room exists + space available
 * 4. Backend adds user to participants
 * 5. Socket.IO notifies everyone room user joined
 */
export const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId })
      .populate('participants.user', 'username email')
      .populate('creator', 'username email');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check room status
    if (room.status === 'ended' || room.status === 'archived') {
      return res.status(400).json({ message: 'This room has ended' });
    }

    // Check if already a participant
    const isParticipant = room.participants.some(p => 
      p.user._id.toString() === userId && p.status === 'active'
    );
    
    if (isParticipant) {
      return res.status(400).json({ message: 'You are already in this room' });
    }

    // Check if room is full
    if (room.isFull()) {
      return res.status(400).json({ message: 'Room is full' });
    }

    // Add user to room
    await room.addParticipant(userId);

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      room: {
        id: room._id,
        roomId: room.roomId,
        debateId: room.debate,
        topic: room.topic,
        status: room.status,
        participants: room.participants,
        messages: room.messages.slice(-50), // Last 50 messages
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining room', error: error.message });
  }
});

/**
 * Get room details
 * 
 * Returns:
 * - Room info
 * - Participants
 * - Recent messages
 * - Room status
 */
export const getRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await DebateRoom.findOne({ roomId })
      .populate('creator', 'username email')
      .populate('participants.user', 'username email')
      .populate('debate', 'topic aiPersona');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        debateId: room.debate._id,
        topic: room.topic,
        debate: room.debate,
        creator: room.creator,
        participants: room.participants,
        status: room.status,
        startedAt: room.startedAt,
        endedAt: room.endedAt,
        messageCount: room.messageCount,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
});

/**
 * Get room messages
 * 
 * Pagination supported
 * Default: last 50 messages
 */
export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, skip = 0 } = req.query;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get messages with pagination
    const totalMessages = room.messages.length;
    const messages = room.messages
      .slice(Math.max(0, totalMessages - limit - skip), totalMessages - skip)
      .reverse();

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        total: totalMessages,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

/**
 * Add message to room
 * 
 * Called by Socket.IO event handler
 * Saves message to database
 */
export const addMessageToRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { message, position } = req.body;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get user info
    const user = await User.findById(userId);

    // Add message
    await room.addMessage(userId, user.username, message, position);

    res.status(201).json({
      success: true,
      message: {
        userId,
        userName: user.username,
        message,
        position,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error: error.message });
  }
});

/**
 * Leave room
 * 
 * FLOW:
 * 1. User clicks "Leave Debate"
 * 2. Frontend: POST /api/rooms/:roomId/leave
 * 3. Backend marks user as left
 * 4. Socket.IO notifies everyone user left
 */
export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Remove participant
    await room.removeParticipant(userId);

    // If no active participants left, end room
    const activeParticipants = room.getActiveParticipants();
    if (activeParticipants.length === 0) {
      await room.endRoom();
    }

    res.status(200).json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving room', error: error.message });
  }
});

/**
 * End room
 * 
 * Only creator can end room
 * Marks room as ended
 * Saves debate transcript
 */
export const endRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check authorization
    if (room.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only room creator can end the debate' });
    }

    // End room
    await room.endRoom();

    // Update debate with room transcript
    await Debate.findByIdAndUpdate(
      room.debate,
      {
        messages: room.messages.map(msg => ({
          sender: msg.userName,
          text: msg.message,
          createdAt: msg.timestamp,
        })),
        status: 'completed',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Room ended successfully',
      room: {
        id: room._id,
        roomId: room.roomId,
        status: 'ended',
        endedAt: room.endedAt,
        messageCount: room.messageCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error ending room', error: error.message });
  }
});

/**
 * Start room
 * 
 * Transitions room from 'waiting' to 'active'
 * Only creator can start
 */
export const startRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await DebateRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check authorization
    if (room.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only room creator can start the debate' });
    }

    // Check room has at least 2 participants
    if (room.getActiveParticipants().length < 2) {
      return res.status(400).json({ message: 'Need at least 2 participants to start' });
    }

    // Start room
    room.status = 'active';
    room.startedAt = new Date();
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Debate started',
      room: {
        id: room._id,
        roomId: room.roomId,
        status: room.status,
        startedAt: room.startedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting room', error: error.message });
  }
});

/**
 * Get user's active rooms
 * 
 * Returns all rooms user is currently in
 */
export const getUserRooms = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const rooms = await DebateRoom.find({
      'participants.user': userId,
      'participants.status': 'active',
    })
      .populate('debate', 'topic')
      .populate('creator', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rooms: rooms.map(room => ({
        id: room._id,
        roomId: room.roomId,
        debateId: room.debate._id,
        topic: room.topic || room.debate.topic,
        creator: room.creator,
        status: room.status,
        participantCount: room.getActiveParticipants().length,
        messageCount: room.messageCount,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});
