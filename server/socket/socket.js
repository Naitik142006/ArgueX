import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import DebateRoom from '../models/DebateRoom.js';
import User from '../models/User.js';
import sentimentService from '../services/sentimentService.js';

/**
 * Socket.IO Architecture
 * 
 * LIFECYCLE:
 * 1. Client connects → socket object created
 * 2. Server receives 'connection' event
 * 3. Authenticate user via JWT
 * 4. Join user to room
 * 5. Listen for events (emit/on)
 * 6. Handle disconnect → cleanup
 * 
 * TERMINOLOGY:
 * - socket: Individual connection (client)
 * - io: Server instance (can emit to all sockets)
 * - room: Group of sockets (can broadcast to room)
 * - emit: Send event TO server/client
 * - on: Listen FOR event FROM server/client
 * - broadcast: Send to all EXCEPT sender
 */

/**
 * Initialize Socket.IO
 * @param {http.Server} server - Express HTTP server
 * @param {object} options - Socket.IO options
 */
export const initializeSocket = (server, options = {}) => {
  const io = new Server(server, {
    cors: {
      origin: [/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/],
      credentials: true,
    },
    ...options,
  });

  /**
   * MIDDLEWARE: Authenticate socket connections
   * 
   * Every socket connection passes through this middleware.
   * If auth fails, connection is rejected.
   */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      // Development bypass: allow connections without token when explicitly enabled
      if (!token) {
        if (process.env.ALLOW_SOCKET_NOAUTH === 'true' && process.env.NODE_ENV !== 'production') {
          socket.userId = 'dev-user-0001';
          socket.userEmail = 'dev@local';
          socket.userName = 'DevBypassUser';
          console.warn('Socket connected without token (dev bypass enabled).');
          return next();
        }

        return next(new Error('Authentication error: no token'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Fetch user from DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket object
      socket.userId = user._id;
      socket.userEmail = user.email;
      socket.userName = user.username || user.name || 'User';

      console.log(`✓ Socket authenticated: ${socket.id} (User: ${socket.userName})`);
      next();
    } catch (error) {
      console.error('✗ Socket authentication failed:', error.message);
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  /**
   * EVENT: User connects
   * 
   * Example ArgueX flow:
   * 1. User opens app → React connects to Socket.IO
   * 2. Server receives 'connection' event
   * 3. Server adds user to "users_online" room
   * 4. Server broadcasts "userOnline" to all clients
   */
  io.on('connection', (socket) => {
    console.log(`
    ╔════════════════════════════════════╗
    ║ NEW CONNECTION                     ║
    ║ Socket ID: ${socket.id.substring(0, 8)}...      ║
    ║ User: ${socket.userName}${' '.repeat(Math.max(0, 15 - (socket.userName?.length || 0)))}║
    ║ Time: ${new Date().toLocaleTimeString()}${' '.repeat(20)}║
    ╚════════════════════════════════════╝
    `);

    // Add user to global "users_online" room
    socket.join('users_online');

    // Broadcast that user is online
    io.emit('userOnline', {
      userId: socket.userId,
      userName: socket.userName,
      socketId: socket.id,
      timestamp: new Date(),
    });

    /**
     * EVENT: User joins a debate room
     * 
     * Flow:
     * User A emits: socket.emit('joinRoom', { roomId: 'debate-123' })
     *   ↓
     * Server receives: socket.on('joinRoom', ...)
     *   ↓
     * Server joins socket to room: socket.join(roomId)
     *   ↓
     * Server broadcasts to room: io.to(roomId).emit('roomJoined', ...)
     *   ↓
     * All in room receive update (including User A)
     */
    socket.on('joinRoom', (data) => {
      const { roomId } = data;
      
      console.log(`📍 ${socket.userName} joined room ${roomId}`);

      // Add this socket to the room
      socket.join(roomId);
      
      // Store room in socket for later reference
      socket.currentRoom = roomId;

      // Tell everyone in this room that user joined
      io.to(roomId).emit('userJoined', {
        userId: socket.userId,
        userName: socket.userName,
        roomId,
        timestamp: new Date(),
        message: `${socket.userName} joined the debate`,
      });

      // Get all users in this room and send to the joining user
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      const usersInRoom = Array.from(roomSockets || []).map(socketId => {
        const userSocket = io.sockets.sockets.get(socketId);
        return {
          userId: userSocket.userId,
          userName: userSocket.userName,
          socketId: socketId,
        };
      });

      // Send room state to the joining user
      socket.emit('roomState', {
        roomId,
        usersInRoom,
        userCount: usersInRoom.length,
      });
    });

    /**
     * EVENT: User leaves a debate room
     * 
     * Flow:
     * User clicks "Leave" → socket.emit('leaveRoom', ...)
     *   ↓
     * Server receives → socket.leave(roomId)
     *   ↓
     * Remaining users see "user left"
     */
    socket.on('leaveRoom', (data) => {
      const { roomId } = data;
      
      console.log(`📍 ${socket.userName} left room ${roomId}`);

      // Remove socket from room
      socket.leave(roomId);
      socket.currentRoom = null;

      // Notify everyone in room that user left
      io.to(roomId).emit('userLeft', {
        userId: socket.userId,
        userName: socket.userName,
        roomId,
        timestamp: new Date(),
        message: `${socket.userName} left the debate`,
      });
    });

    /**
     * EVENT: Send debate message (core ArgueX feature)
     * 
     * Flow:
     * User A emits: socket.emit('debateMessage', { message: '...', roomId: '...' })
     *   ↓
     * Server validates and saves to MongoDB
     *   ↓
     * Server broadcasts: io.to(roomId).emit('debateMessage', {})
     *   ↓
     * User A & User B & everyone in room sees message instantly
     * 
     * vs HTTP polling:
     * User A: POST /api/messages
     * User B: Every 2 seconds GET /api/messages
     * 
     * WebSocket is 10x-20x faster! ⚡
     */
    socket.on('debateMessage', async (data) => {
      const { roomId, message, debateId, position } = data;
      
      console.log(`💬 ${socket.userName}: ${message.substring(0, 50)}...`);

      // Validation (in real app, do this on server!)
      if (!message || !roomId) {
        socket.emit('error', { 
          message: 'Invalid message or room' 
        });
        return;
      }

      try {
        // Analyze sentiment for the message
        const sentiment = sentimentService.analyzeSentiment(message);

        // Find and update room with message (include sentiment)
        const room = await DebateRoom.findOne({ roomId });
        if (room) {
          await room.addMessage(socket.userId, socket.userName, message, position, null, sentiment);
        }

        const messageData = {
          userId: socket.userId,
          userName: socket.userName,
          message,
          roomId,
          debateId,
          position,
          sentiment,
          socketId: socket.id,
          timestamp: new Date(),
        };

        // Broadcast to EVERYONE in the room (including sender)
        io.to(roomId).emit('debateMessage', messageData);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { 
          message: 'Failed to save message' 
        });
      }
    });

    /**
     * EVENT: Typing indicator
     * 
     * Real-time UX: Show "User is typing..."
     * 
     * User A types → socket.emit('userTyping', { roomId })
     *   ↓
     * Server broadcasts: io.to(roomId).emit('userTyping', ...)
     *   ↓
     * User B sees: "Alice is typing..."
     */
    socket.on('userTyping', (data) => {
      const { roomId } = data;
      
      // Broadcast to room (NOT including sender)
      socket.broadcast.to(roomId).emit('userTyping', {
        userId: socket.userId,
        userName: socket.userName,
        roomId,
      });
    });

    /**
     * EVENT: Stop typing
     * 
     * User A finishes typing → socket.emit('userStoppedTyping', { roomId })
     *   ↓
     * Remove "User is typing..." indicator
     */
    socket.on('userStoppedTyping', (data) => {
      const { roomId } = data;
      
      socket.broadcast.to(roomId).emit('userStoppedTyping', {
        userId: socket.userId,
        roomId,
      });
    });

    /**
     * EVENT: Add reaction to message
     * 
     * User A clicks 👍 on User B's message
     *   ↓
     * socket.emit('addReaction', { roomId, messageId, reaction })
     *   ↓
     * Server adds reaction to message
     *   ↓
     * io.to(roomId).emit('reactionAdded', {...})
     *   ↓
     * All users see message now has more reactions
     */
    socket.on('addReaction', async (data) => {
      const { roomId, messageId, reaction } = data;

      try {
        const room = await DebateRoom.findOne({ roomId });
        if (room) {
          await room.addReaction(messageId, reaction, socket.userId);

          // Broadcast to room
          io.to(roomId).emit('reactionAdded', {
            messageId,
            reaction,
            userId: socket.userId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    /**
     * EVENT: Remove reaction from message
     */
    socket.on('removeReaction', async (data) => {
      const { roomId, messageId, reaction } = data;

      try {
        const room = await DebateRoom.findOne({ roomId });
        if (room) {
          await room.removeReaction(messageId, reaction, socket.userId);

          io.to(roomId).emit('reactionRemoved', {
            messageId,
            reaction,
            userId: socket.userId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error removing reaction:', error);
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    /**
     * EVENT: Edit message
     * 
     * User edits own message
     *   ↓
     * socket.emit('editMessage', { messageId, newMessage })
     *   ↓
     * Server updates message + records edit
     *   ↓
     * io.to(roomId).emit('messageEdited', {...})
     *   ↓
     * All users see message updated with (edited) flag
     */
    socket.on('editMessage', async (data) => {
      const { roomId, messageId, newMessage } = data;

      try {
        const room = await DebateRoom.findOne({ roomId });
        if (room) {
          await room.editMessage(messageId, newMessage, socket.userId);

          // Re-run sentiment on edited message and persist
          const updatedMessage = room.messages.find(m => m._id.toString() === messageId.toString());
          if (updatedMessage) {
            const newSentiment = sentimentService.analyzeSentiment(newMessage);
            updatedMessage.sentiment = {
              label: newSentiment.label,
              score: newSentiment.score,
              confidence: newSentiment.confidence,
              emotion: newSentiment.emotion,
            };
            await room.save();
          }

          io.to(roomId).emit('messageEdited', {
            messageId,
            newMessage,
            isEdited: true,
            lastEditedAt: updatedMessage ? updatedMessage.lastEditedAt : new Date(),
            sentiment: updatedMessage ? updatedMessage.sentiment : null,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    /**
     * EVENT: Delete message
     */
    socket.on('deleteMessage', async (data) => {
      const { roomId, messageId } = data;

      try {
        const room = await DebateRoom.findOne({ roomId });
        if (room) {
          await room.deleteMessage(messageId, socket.userId);

          io.to(roomId).emit('messageDeleted', {
            messageId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    /**
     * EVENT: Pin message (for important points)
     */
    socket.on('pinMessage', async (data) => {
      const { roomId, messageId } = data;

      try {
        const room = await DebateRoom.findOne({ roomId });
        if (room && room.creator.equals(socket.userId)) {
          await room.pinMessage(messageId, socket.userId);

          io.to(roomId).emit('messagePinned', {
            messageId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error pinning message:', error);
        socket.emit('error', { message: 'Failed to pin message' });
      }
    });

    /**
     * EVENT: Reply to message (threaded)
     * 
     * User replies to specific message
     *   ↓
     * socket.emit('replyToMessage', { parentId, message })
     *   ↓
     * Server creates reply with parentId
     *   ↓
     * io.to(roomId).emit('replySent', {...})
     *   ↓
     * Thread updates on UI
     */
    socket.on('replyToMessage', async (data) => {
      const { roomId, parentId, message, position } = data;

      try {
        const room = await DebateRoom.findOne({ roomId });
        if (room) {
          await room.addMessage(socket.userId, socket.userName, message, position, parentId);

          const newMessage = room.messages[room.messages.length - 1];

          io.to(roomId).emit('replySent', {
            messageId: newMessage._id,
            parentId,
            userId: socket.userId,
            userName: socket.userName,
            message,
            position,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error replying to message:', error);
        socket.emit('error', { message: 'Failed to send reply' });
      }
    });

    /**
     * ==========================================
     * MULTIPLAYER TRANSCRIPTS (Phase 7B)
     * ==========================================
     */
    socket.on('multiplayer-message', ({ roomId, text }) => {
      if (!roomId || !text) return;

      const message = {
        _id: Math.random().toString(36).substring(2, 9),
        sender: socket.userName,
        userId: socket.userId,
        text: text,
        timestamp: new Date()
      };

      // Store in memory (for AI judging later)
      if (!global.multiplayerTranscripts) {
        global.multiplayerTranscripts = new Map();
      }
      if (!global.multiplayerTranscripts.has(roomId)) {
        global.multiplayerTranscripts.set(roomId, []);
      }
      global.multiplayerTranscripts.get(roomId).push(message);

      // Broadcast to everyone in the room (including sender)
      io.to(roomId).emit('multiplayer-transcript-update', message);
    });

    /**
     * ==========================================
     * WEBRTC SIGNALING (Phase 6)
     * ==========================================
     */
    socket.on('webrtc-offer', ({ roomId, offer, senderUserId, targetUserId }) => {
      // Forward the offer to the room, so the specific target can pick it up
      socket.to(roomId).emit('webrtc-offer', { offer, senderUserId, targetUserId });
    });

    socket.on('webrtc-answer', ({ roomId, answer, senderUserId, targetUserId }) => {
      // Forward the answer
      socket.to(roomId).emit('webrtc-answer', { answer, senderUserId, targetUserId });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate, senderUserId, targetUserId }) => {
      // Forward the ICE candidate
      socket.to(roomId).emit('webrtc-ice-candidate', { candidate, senderUserId, targetUserId });
    });

    /**
     * EVENT: Disconnect
     * 
     * User closes browser, network drops, etc.
     * 
     * Flow:
     * Socket auto-detects disconnect
     *   ↓
     * Server runs disconnect handler
     *   ↓
     * Remove from room, notify others
     *   ↓
     * Clean up socket resources
     */
    socket.on('disconnect', (reason) => {
      console.log(`
      ╔════════════════════════════════════╗
      ║ DISCONNECTED                       ║
      ║ User: ${socket.userName}${' '.repeat(Math.max(0, 17 - (socket.userName?.length || 0)))}║
      ║ Reason: ${reason}${' '.repeat(Math.max(0, 26 - (reason?.length || 0)))}║
      ║ Time: ${new Date().toLocaleTimeString()}${' '.repeat(20)}║
      ╚════════════════════════════════════╝
      `);

      // If user was in a room, notify others
      if (socket.currentRoom) {
        io.to(socket.currentRoom).emit('userLeft', {
          userId: socket.userId,
          userName: socket.userName,
          roomId: socket.currentRoom,
          timestamp: new Date(),
          message: `${socket.userName} disconnected`,
        });
      }

      // Broadcast user is offline
      io.emit('userOffline', {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
      });

      // TODO: Update user presence in database
      // TODO: Handle reconnection for tournaments/active debates
    });

    /**
     * EVENT: Error handler
     * 
     * If client receives error event, log it
     */
    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.userName}:`, error);
    });
  });

  return io;
};

export default initializeSocket;
