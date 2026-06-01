import mongoose from 'mongoose';

/**
 * Enhanced Message Schema with reactions, edits, and threads
 */
const enhancedMessageSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: String,
    message: String,
    position: {
      type: String,
      enum: ['pro', 'con', 'neutral'],
    },
    
    // Threading support
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // null = root message, otherwise reply to another
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    
    // Message reactions: { '👍': [userId1, userId2], '👎': [userId3] }
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId],
      default: new Map(),
    },
    reactionCount: {
      type: Number,
      default: 0,
    },
    
    // Edit history
    edits: [
      {
        originalMessage: String,
        editedAt: Date,
        editedBy: mongoose.Schema.Types.ObjectId,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    lastEditedAt: Date,
    
    // Sentiment analysis
    sentiment: {
      label: {
        type: String,
        enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
        default: 'NEUTRAL',
      },
      score: {
        type: Number,
        min: -1,
        max: 1,
        default: 0,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },
      emotion: {
        type: String,
        enum: ['ASSERTIVE', 'CURIOUS', 'CONCERNED', 'SUPPORTIVE', 'CRITICAL', 'NEUTRAL'],
        default: 'NEUTRAL',
      },
    },
    
    // Message metrics
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: mongoose.Schema.Types.ObjectId,
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

/**
 * DebateRoom Model
 * 
 * Represents a live debate session with real-time chat
 * 
 * FLOW:
 * 1. User creates debate → Room created
 * 2. Other users join room → Socket.IO adds to room
 * 3. Messages exchanged → Stored in messages array
 * 4. Debate ends → Room closed, transcript saved
 */

const debateRoomSchema = mongoose.Schema(
  {
    // Reference to debate
    debate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Debate',
      required: true,
    },

    // Room identifier (used by Socket.IO)
    roomId: {
      type: String,
      unique: true,
      required: true,
      index: true, // For fast lookups
    },

    // Room creator (debate initiator)
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // All participants in the room
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: Date, // When user left room
        status: {
          type: String,
          enum: ['active', 'inactive', 'left'],
          default: 'active',
        },
      },
    ],

    // Real-time messages in the room (with enhanced features)
    messages: [enhancedMessageSchema],

    // Room state
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended', 'archived'],
      default: 'waiting',
      index: true,
    },

    // Timing info
    startedAt: Date,
    endedAt: Date,
    maxDuration: {
      type: Number,
      default: 3600, // 1 hour in seconds
    },

    // Max participants allowed
    maxParticipants: {
      type: Number,
      default: 2,
    },

    // Debate topic/position
    topic: String,
    position: {
      type: String,
      enum: ['pro', 'con'],
    },

    // Settings
    isPublic: {
      type: Boolean,
      default: false,
    },
    allowSpectators: {
      type: Boolean,
      default: true,
    },

    // Metadata
    messageCount: {
      type: Number,
      default: 0,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    
    // Debate statistics (calculated in real-time)
    statistics: {
      averageMessageLength: Number,
      averageSentimentScore: Number,
      dominantSentiment: {
        type: String,
        enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
      },
      agreementRate: Number, // Percentage 0-100
      topReaction: String, // Most used emoji
      reactionCount: {
        type: Number,
        default: 0,
      },
      averageMessageRate: Number, // messages per minute
      threadsCount: {
        type: Number,
        default: 0,
      },
      pinnedMessagesCount: {
        type: Number,
        default: 0,
      },
      editsCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      { debate: 1 },
      { roomId: 1 },
      { creator: 1 },
      { status: 1 },
      { createdAt: -1 },
    ],
  }
);

/**
 * Pre-save: Ensure roomId is set
 */
debateRoomSchema.pre('save', function(next) {
  if (!this.roomId) {
    // Generate roomId: debate_<id>_<timestamp>
    this.roomId = `debate_${this.debate}_${Date.now()}`;
  }
  next();
});

/**
 * Method: Add message to room
 */
debateRoomSchema.methods.addMessage = function(userId, userName, message, position, parentId = null) {
  const messageId = new mongoose.Types.ObjectId();
  
  this.messages.push({
    _id: messageId,
    userId,
    userName,
    message,
    position,
    parentId,
    createdAt: new Date(),
  });
  
  this.messageCount = this.messages.length;
  
  // If this is a reply, increment parent's replyCount
  if (parentId) {
    const parent = this.messages.find(m => m._id.equals(parentId));
    if (parent) {
      parent.replyCount = (parent.replyCount || 0) + 1;
      if (!this.statistics) {
        this.statistics = {};
      }
      this.statistics.threadsCount = this.messages.filter(m => m.parentId !== null && m.parentId !== undefined).length;
    }
  }
  
  return this.save();
};

/**
 * Method: Add reaction to message
 * @param {ObjectId} messageId - Message ID
 * @param {string} reaction - Emoji reaction (e.g., 'thumbsup')
 * @param {ObjectId} userId - User adding reaction
 */
debateRoomSchema.methods.addReaction = async function(messageId, reaction, userId) {
  const message = this.messages.find(m => m._id.equals(messageId));
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  if (!message.reactions) {
    message.reactions = new Map();
  }
  
  // Get current reaction users
  const reactionUsers = message.reactions.get(reaction) || [];
  
  // Check if user already reacted
  const userAlreadyReacted = reactionUsers.some(id => id.equals(userId));
  
  if (!userAlreadyReacted) {
    reactionUsers.push(userId);
    message.reactions.set(reaction, reactionUsers);
    message.reactionCount = (message.reactionCount || 0) + 1;
    
    // Update room statistics
    if (!this.statistics) {
      this.statistics = {};
    }
    this.statistics.reactionCount = (this.statistics.reactionCount || 0) + 1;
  }
  
  return this.save();
};

/**
 * Method: Remove reaction from message
 */
debateRoomSchema.methods.removeReaction = async function(messageId, reaction, userId) {
  const message = this.messages.find(m => m._id.equals(messageId));
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  if (message.reactions && message.reactions.has(reaction)) {
    const reactionUsers = message.reactions.get(reaction);
    const index = reactionUsers.findIndex(id => id.equals(userId));
    
    if (index > -1) {
      reactionUsers.splice(index, 1);
      
      if (reactionUsers.length === 0) {
        message.reactions.delete(reaction);
      }
      
      message.reactionCount = Math.max(0, (message.reactionCount || 1) - 1);
    }
  }
  
  return this.save();
};

/**
 * Method: Edit message
 * @param {ObjectId} messageId - Message ID
 * @param {string} newMessage - New message text
 * @param {ObjectId} userId - User editing (must be original author)
 */
debateRoomSchema.methods.editMessage = async function(messageId, newMessage, userId) {
  const message = this.messages.find(m => m._id.equals(messageId));
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  if (!message.userId.equals(userId)) {
    throw new Error('Can only edit your own messages');
  }
  
  // Store original for history
  if (!message.edits) {
    message.edits = [];
  }
  
  message.edits.push({
    originalMessage: message.message,
    editedAt: new Date(),
    editedBy: userId,
  });
  
  message.message = newMessage;
  message.isEdited = true;
  message.lastEditedAt = new Date();
  message.updatedAt = new Date();
  
  // Update statistics
  if (!this.statistics) {
    this.statistics = {};
  }
  this.statistics.editsCount = (this.statistics.editsCount || 0) + 1;
  
  return this.save();
};

/**
 * Method: Delete message
 */
debateRoomSchema.methods.deleteMessage = async function(messageId, userId) {
  const messageIndex = this.messages.findIndex(m => m._id.equals(messageId));
  
  if (messageIndex === -1) {
    throw new Error('Message not found');
  }
  
  const message = this.messages[messageIndex];
  
  if (!message.userId.equals(userId) && !this.creator.equals(userId)) {
    throw new Error('Can only delete your own messages or be room creator');
  }
  
  this.messages.splice(messageIndex, 1);
  this.messageCount = this.messages.length;
  
  return this.save();
};

/**
 * Method: Pin message (for important points)
 */
debateRoomSchema.methods.pinMessage = async function(messageId, userId) {
  const message = this.messages.find(m => m._id.equals(messageId));
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  message.isPinned = true;
  message.pinnedBy = userId;
  
  if (!this.statistics) {
    this.statistics = {};
  }
  this.statistics.pinnedMessagesCount = (this.statistics.pinnedMessagesCount || 0) + 1;
  
  return this.save();
};

/**
 * Method: Unpin message
 */
debateRoomSchema.methods.unpinMessage = async function(messageId) {
  const message = this.messages.find(m => m._id.equals(messageId));
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  message.isPinned = false;
  message.pinnedBy = null;
  
  if (this.statistics && this.statistics.pinnedMessagesCount > 0) {
    this.statistics.pinnedMessagesCount -= 1;
  }
  
  return this.save();
};

/**
 * Method: Calculate debate statistics
 */
debateRoomSchema.methods.calculateStatistics = function() {
  if (this.messages.length === 0) return;
  
  // Average message length
  const avgLength = this.messages.reduce((sum, m) => sum + (m.message?.length || 0), 0) / this.messages.length;
  
  // Average sentiment
  const sentiments = this.messages.filter(m => m.sentiment?.score !== undefined);
  const avgSentiment = sentiments.length > 0
    ? sentiments.reduce((sum, m) => sum + m.sentiment.score, 0) / sentiments.length
    : 0;
  
  // Dominant sentiment
  const sentimentCounts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
  sentiments.forEach(m => {
    sentimentCounts[m.sentiment.label]++;
  });
  const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) =>
    sentimentCounts[a] > sentimentCounts[b] ? a : b
  );
  
  // Agreement rate (based on reactions)
  const topReactions = {};
  this.messages.forEach(m => {
    if (m.reactions) {
      m.reactions.forEach((users, emoji) => {
        topReactions[emoji] = (topReactions[emoji] || 0) + users.length;
      });
    }
  });
  const topEmoji = Object.keys(topReactions).length > 0
    ? Object.keys(topReactions).reduce((a, b) => topReactions[a] > topReactions[b] ? a : b)
    : null;
  
  // Update statistics
  if (!this.statistics) {
    this.statistics = {};
  }
  
  this.statistics.averageMessageLength = Math.round(avgLength);
  this.statistics.averageSentimentScore = Math.round(avgSentiment * 100) / 100;
  this.statistics.dominantSentiment = dominantSentiment;
  this.statistics.topReaction = topEmoji;
  this.statistics.agreementRate = Math.round((avgSentiment + 1) / 2 * 100); // Normalize -1 to 1 into 0-100%
  
  if (this.startedAt && this.endedAt) {
    const durationMinutes = (this.endedAt - this.startedAt) / 60000;
    this.statistics.averageMessageRate = Math.round((this.messageCount / durationMinutes) * 10) / 10;
  }
  
  this.statistics.threadsCount = this.messages.filter(m => m.parentId).length;
  this.statistics.pinnedMessagesCount = this.messages.filter(m => m.isPinned).length;
  this.statistics.editsCount = this.messages.reduce((sum, m) => sum + (m.edits?.length || 0), 0);
};


/**
 * Method: Add participant
 */
debateRoomSchema.methods.addParticipant = function(userId) {
  const exists = this.participants.some(p => p.user.equals(userId));
  if (!exists && this.participants.length < this.maxParticipants) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      status: 'active',
    });
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Method: Remove participant
 */
debateRoomSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));
  if (participant) {
    participant.status = 'left';
    participant.leftAt = new Date();
  }
  return this.save();
};

/**
 * Method: Get active participants
 */
debateRoomSchema.methods.getActiveParticipants = function() {
  return this.participants.filter(p => p.status === 'active');
};

/**
 * Method: Check if room is full
 */
debateRoomSchema.methods.isFull = function() {
  const activeCount = this.getActiveParticipants().length;
  return activeCount >= this.maxParticipants;
};

/**
 * Method: End room
 */
debateRoomSchema.methods.endRoom = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  return this.save();
};

const DebateRoom = mongoose.model('DebateRoom', debateRoomSchema);
export default DebateRoom;
