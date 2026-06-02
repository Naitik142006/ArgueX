import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emitEvent, listenEvent, removeEventListener, getSocket } from '../services/socketService';
import ChatWindow from './ChatWindow';
import ParticipantList from './ParticipantList';
import DebateStatistics from './DebateStatistics';
import MessageThread from './MessageThread';
import '../styles/DebateRoom.css';

/**
 * DebateRoom Component
 * 
 * Main component for live debate
 * Handles:
 * - Socket.IO connection
 * - Room management
 * - Message broadcasting
 * - Participant tracking
 */
export default function DebateRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomStatus, setRoomStatus] = useState('waiting'); // waiting, active, ended
  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);

  /**
   * Initialize room and Socket.IO connection
   */
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        setIsLoading(true);

        // Fetch room details from API
        const response = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch room');
        }

        const data = await response.json();
        setRoom(data.room);
        setParticipants(data.room.participants);
        setRoomStatus(data.room.status);

        // Load messages
        const messagesResponse = await fetch(
          `http://localhost:5000/api/rooms/${roomId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing room:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeRoom();
  }, [roomId]);

  /**
   * Set up Socket.IO listeners
   */
  useEffect(() => {
    // Join the room via Socket.IO
    emitEvent('joinRoom', { roomId });

    /**
     * Listen for room state updates
     */
    const handleRoomState = (data) => {
      console.log('Room state updated:', data);
      setParticipants(
        data.usersInRoom.map(user => ({
          user: { _id: user.userId, username: user.userName },
          joinedAt: new Date(),
          status: 'active',
        }))
      );
    };
    listenEvent('roomState', handleRoomState);

    /**
     * Listen for incoming messages
     */
    const handleDebateMessage = (data) => {
      console.log('New message:', data);
      setMessages(prev => [...prev, data]);
    };
    listenEvent('debateMessage', handleDebateMessage);

    // Reactions
    const handleReactionAdded = (data) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, reactionCount: (m.reactionCount || 0) + 1 } : m));
    };
    listenEvent('reactionAdded', handleReactionAdded);

    const handleReactionRemoved = (data) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, reactionCount: Math.max(0, (m.reactionCount || 1) - 1) } : m));
    };
    listenEvent('reactionRemoved', handleReactionRemoved);

    // Message edited
    const handleMessageEdited = (data) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, message: data.newMessage, isEdited: true, lastEditedAt: data.lastEditedAt } : m));
    };
    listenEvent('messageEdited', handleMessageEdited);

    // Message deleted
    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    };
    listenEvent('messageDeleted', handleMessageDeleted);

    // Message pinned
    const handleMessagePinned = (data) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, isPinned: true } : m));
    };
    listenEvent('messagePinned', handleMessagePinned);

    // Reply sent (thread count)
    const handleReplySent = (data) => {
      setMessages(prev => prev.map(m => m._id === data.parentId ? { ...m, replyCount: (m.replyCount || 0) + 1 } : m));
    };
    listenEvent('replySent', handleReplySent);

    /**
     * Listen for user join
     */
    const handleUserJoined = (data) => {
      console.log(`${data.userName} joined`);
      setParticipants(prev => [
        ...prev,
        {
          user: { _id: data.userId, username: data.userName },
          joinedAt: new Date(),
          status: 'active',
        },
      ]);
    };
    listenEvent('userJoined', handleUserJoined);

    /**
     * Listen for user left
     */
    const handleUserLeft = (data) => {
      console.log(`${data.userName} left`);
      setParticipants(prev =>
        prev.map(p =>
          p.user._id === data.userId
            ? { ...p, status: 'left', leftAt: new Date() }
            : p
        )
      );
    };
    listenEvent('userLeft', handleUserLeft);

    /**
     * Listen for typing indicators
     */
    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        // Check if user already in list
        const exists = prev.some(u => u.userId === data.userId);
        if (!exists) {
          return [...prev, { userId: data.userId, userName: data.userName }];
        }
        return prev;
      });
    };
    listenEvent('userTyping', handleUserTyping);

    /**
     * Listen for stopped typing
     */
    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev =>
        prev.filter(u => u.userId !== data.userId)
      );
    };
    listenEvent('userStoppedTyping', handleUserStoppedTyping);

    /**
     * Cleanup listeners on unmount
     */
    return () => {
      // Cleanup listeners and leave room
      emitEvent('leaveRoom', { roomId });
      removeEventListener('roomState', handleRoomState);
      removeEventListener('debateMessage', handleDebateMessage);
      removeEventListener('userJoined', handleUserJoined);
      removeEventListener('userLeft', handleUserLeft);
      removeEventListener('userTyping', handleUserTyping);
      removeEventListener('userStoppedTyping', handleUserStoppedTyping);
      removeEventListener('reactionAdded', handleReactionAdded);
      removeEventListener('reactionRemoved', handleReactionRemoved);
      removeEventListener('messageEdited', handleMessageEdited);
      removeEventListener('messageDeleted', handleMessageDeleted);
      removeEventListener('messagePinned', handleMessagePinned);
      removeEventListener('replySent', handleReplySent);
    };
  }, [roomId]);

  /**
   * Handle sending message
   */
  const handleSendMessage = (message, position) => {
    emitEvent('debateMessage', {
      message,
      roomId,
      position,
      debateId: room?.debateId,
    });

    // Also emit stopped typing
    emitEvent('userStoppedTyping', { roomId });
  };

  /**
   * Reaction handlers -> emit socket events
   */
  const handleAddReaction = (messageId, reaction) => {
    emitEvent('addReaction', { roomId, messageId, reaction });
  };

  const handleRemoveReaction = (messageId, reaction) => {
    emitEvent('removeReaction', { roomId, messageId, reaction });
  };

  const handleEditMessage = (messageId, newMessage) => {
    emitEvent('editMessage', { roomId, messageId, newMessage });
  };

  const handleDeleteMessage = (messageId) => {
    emitEvent('deleteMessage', { roomId, messageId });
  };

  const handlePinMessage = (messageId) => {
    emitEvent('pinMessage', { roomId, messageId });
  };

  const handleReplyToMessage = (parentId, message, position) => {
    emitEvent('replyToMessage', { roomId, parentId, message, position });
  };

  const handleShowThread = (messageId) => {
    setSelectedThread(messageId);
  };

  /**
   * Handle typing
   */
  const handleTyping = () => {
    emitEvent('userTyping', { roomId });
  };

  /**
   * Handle stopped typing
   */
  const handleStoppedTyping = () => {
    emitEvent('userStoppedTyping', { roomId });
  };

  /**
   * Handle ending debate
   */
  const handleEndDebate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}/end`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        setRoomStatus('ended');
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error ending debate:', error);
    }
  };

  /**
   * Handle leaving debate
   */
  const handleLeaveDebate = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/rooms/${roomId}/leave`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving debate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="debate-room loading">
        <div className="loading-spinner">Loading debate room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="debate-room error">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => navigate('/dashboard')}>
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="debate-room">
      <div className="debate-room-container">
        {/* Header */}
        <div className="debate-header">
          <div className="debate-info">
            <h1>{room?.topic || 'Live Debate'}</h1>
            <div className="debate-meta">
              <span className={`room-status ${roomStatus}`}>
                {roomStatus.toUpperCase()}
              </span>
              {room?.position && (
                <span className="debate-position">
                  Position: {room.position}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="debate-actions">
            {roomStatus === 'waiting' && user?.id === room?.creator._id && (
              <button className="btn btn-primary" onClick={() => {
                // TODO: Implement start room
              }}>
                Start Debate
              </button>
            )}
            {roomStatus === 'active' && user?.id === room?.creator._id && (
              <button className="btn btn-danger" onClick={handleEndDebate}>
                End Debate
              </button>
            )}
            {roomStatus !== 'ended' && (
              <button className="btn btn-secondary" onClick={handleLeaveDebate}>
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Main content: Chat + Participants */}
        <div className="debate-content">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onStoppedTyping={handleStoppedTyping}
              typingUsers={typingUsers}
              currentUser={user}
              isLoading={isLoading}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onPinMessage={handlePinMessage}
              onReply={(mid) => setSelectedThread(mid)}
              onShowThread={handleShowThread}
            />

          <ParticipantList
            participants={participants}
            currentUser={user}
            maxParticipants={room?.maxParticipants || 2}
          />
        </div>

        {/* Statistics panel */}
        <div className="statistics-toggle">
          <button className="btn btn-outline" onClick={() => setShowStatistics(!showStatistics)}>
            {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
          </button>
        </div>

        {showStatistics && (
          <div className="statistics-panel">
            <DebateStatistics roomId={roomId} socket={getSocket()} currentUser={user} />
          </div>
        )}

        {/* Thread modal */}
        {selectedThread && (
          <MessageThread
            message={messages.find(m => m._id === selectedThread)}
            roomId={roomId}
            currentUser={user}
            onClose={() => setSelectedThread(null)}
            onSendReply={({ parentId, message, position }) => handleReplyToMessage(parentId, message, position)}
            onAddReaction={(mid, emoji) => handleAddReaction(mid, emoji)}
          />
        )}

        {/* Status message when room ends */}
        {roomStatus === 'ended' && (
          <div className="debate-ended-message">
            <p>This debate has ended. Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
