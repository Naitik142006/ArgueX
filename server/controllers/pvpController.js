import asyncHandler from '../middleware/asyncHandler.js';
import PvPRoom from '../models/PvPRoom.js';
import crypto from 'crypto';

/**
 * Generate a short 6-8 char uppercase alphanumeric code
 */
const generateRoomId = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 7);
};

/**
 * @desc    Create a new PvP room
 * @route   POST /api/pvp/create
 * @access  Private
 */
export const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  let roomId;
  let isUnique = false;
  
  // Ensure uniqueness
  while (!isUnique) {
    roomId = generateRoomId();
    const existing = await PvPRoom.findOne({ roomId });
    if (!existing) {
      isUnique = true;
    }
  }

  const room = await PvPRoom.create({
    roomId,
    hostId: userId,
    participants: [userId],
    status: 'waiting',
  });

  res.status(201).json({
    success: true,
    room,
  });
});

/**
 * @desc    Join an existing PvP room via code
 * @route   POST /api/pvp/join
 * @access  Private
 */
export const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const userId = req.user.id;

  if (!roomId) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  const room = await PvPRoom.findOne({ roomId: roomId.toUpperCase() });

  if (!room) {
    return res.status(404).json({ message: 'Room not found or has expired' });
  }

  if (room.status === 'completed') {
    return res.status(400).json({ message: 'This room has already completed its debate' });
  }

  // Add user if not already in participants
  if (!room.participants.includes(userId)) {
    // If room is full (e.g. 2 participants max)
    if (room.participants.length >= 2) {
      return res.status(400).json({ message: 'Room is already full' });
    }
    
    room.participants.push(userId);
    
    // If we now have 2 participants, it's active
    if (room.participants.length === 2) {
      room.status = 'active';
    }
    
    await room.save();
  }

  res.status(200).json({
    success: true,
    room,
  });
});

/**
 * @desc    Leave a PvP room
 * @route   POST /api/pvp/leave
 * @access  Private
 */
export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const userId = req.user.id;

  if (!roomId) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  const room = await PvPRoom.findOne({ roomId: roomId.toUpperCase() });

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  room.participants = room.participants.filter(id => id.toString() !== userId.toString());

  if (room.participants.length === 0) {
    await room.deleteOne();
    return res.status(200).json({ success: true, message: 'Room deleted' });
  } else {
    // If active and someone leaves, maybe set back to waiting or completed
    if (room.status === 'active') {
      room.status = 'waiting';
    }
    await room.save();
  }

  res.status(200).json({ success: true, room });
});
