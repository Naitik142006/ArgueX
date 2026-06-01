# Integration Guide: Advanced Chat System

## Overview
This guide explains how to integrate the new advanced chat components into your existing DebateRoom page.

## Current State
You now have:
1. ✅ Backend services for sentiment analysis
2. ✅ API endpoints for reactions, edits, threads, statistics
3. ✅ Socket.IO event handlers for real-time updates
4. ✅ React components: MessageItem, DebateStatistics, MessageThread
5. ✅ CSS styling for all components

## Integration Steps

### Step 1: Update DebateRoom.jsx
The main debate room component needs to coordinate all sub-components.

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import MessageItem from './MessageItem';
import MessageThread from './MessageThread';
import DebateStatistics from './DebateStatistics';
import '../styles/DebateRoom.css';

export default function DebateRoom() {
  const { roomId } = useParams();
  const { user: currentUser } = useAuth();
  const socket = useSocket().getSocket();

  // State for messages and room
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);

  // New state for enhanced features
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    // Load room data and messages
    const loadRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/rooms/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setRoom(data.room);
        setMessages(data.room.messages);
      } catch (error) {
        console.error('Error loading room:', error);
      }
    };

    loadRoom();

    // Listen for real-time message updates
    if (socket) {
      socket.on('debateMessage', (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on('reactionAdded', (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  reactions: msg.reactions || new Map(),
                  reactionCount: (msg.reactionCount || 0) + 1,
                }
              : msg
          )
        );
      });

      socket.on('reactionRemoved', (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  reactionCount: Math.max(0, (msg.reactionCount || 1) - 1),
                }
              : msg
          )
        );
      });

      socket.on('messageEdited', (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  message: data.newMessage,
                  isEdited: true,
                  lastEditedAt: data.lastEditedAt,
                }
              : msg
          )
        );
      });

      socket.on('messageDeleted', (data) => {
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== data.messageId)
        );
      });

      socket.on('messagePinned', (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, isPinned: true }
              : msg
          )
        );
      });

      socket.on('replySent', (data) => {
        // Update parent message reply count
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.parentId
              ? { ...msg, replyCount: (msg.replyCount || 0) + 1 }
              : msg
          )
        );
      });

      return () => {
        socket.off('debateMessage');
        socket.off('reactionAdded');
        socket.off('reactionRemoved');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('messagePinned');
        socket.off('replySent');
      };
    }
  }, [roomId, socket]);

  // Handle adding reaction
  const handleAddReaction = (messageId, emoji) => {
    socket?.emit('addReaction', {
      roomId,
      messageId,
      reaction: emoji,
    });
  };

  // Handle removing reaction
  const handleRemoveReaction = (messageId, emoji) => {
    socket?.emit('removeReaction', {
      roomId,
      messageId,
      reaction: emoji,
    });
  };

  // Handle editing message
  const handleEditMessage = (messageId, newMessage) => {
    socket?.emit('editMessage', {
      roomId,
      messageId,
      newMessage,
    });
  };

  // Handle deleting message
  const handleDeleteMessage = (messageId) => {
    socket?.emit('deleteMessage', {
      roomId,
      messageId,
    });
  };

  // Handle pinning message
  const handlePinMessage = (messageId) => {
    socket?.emit('pinMessage', {
      roomId,
      messageId,
    });
  };

  // Handle replying to message
  const handleReplyToMessage = (parentId) => {
    setReplyingTo(parentId);
    setSelectedThread(null);
  };

  // Handle showing thread
  const handleShowThread = (messageId) => {
    setSelectedThread(messageId);
  };

  // Handle sending reply
  const handleSendReply = (data) => {
    socket?.emit('replyToMessage', {
      roomId,
      ...data,
    });
  };

  return (
    <div className="debate-room-container">
      {/* Header */}
      <div className="debate-room-header">
        <div className="header-info">
          <h1>{room?.title}</h1>
          <div className="room-stats">
            <span>{messages.length} messages</span>
            <span>|</span>
            <span>{room?.participants?.length} participants</span>
          </div>
        </div>

        <button
          className="stats-toggle-btn"
          onClick={() => setShowStatistics(!showStatistics)}
        >
          📊 {showStatistics ? 'Hide' : 'Show'} Statistics
        </button>
      </div>

      {/* Main content */}
      <div className="debate-room-content">
        {/* Messages section */}
        <div className="messages-section">
          <div className="messages-list">
            {messages.map((msg) => (
              <MessageItem
                key={msg._id}
                message={msg}
                currentUser={currentUser}
                isOwn={msg.userId === currentUser?.id}
                onReply={handleReplyToMessage}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onPin={handlePinMessage}
                onShowThread={handleShowThread}
              />
            ))}
          </div>

          {/* Reply form (if replying to specific message) */}
          {replyingTo && (
            <ReplyForm
              parentId={replyingTo}
              onCancel={() => setReplyingTo(null)}
              onSubmit={(text, position) => {
                handleSendReply({
                  parentId: replyingTo,
                  message: text,
                  position,
                });
                setReplyingTo(null);
              }}
            />
          )}

          {/* Main message input */}
          <ChatInput
            roomId={roomId}
            onSendMessage={(text, position) => {
              socket?.emit('debateMessage', {
                roomId,
                message: text,
                position,
              });
            }}
          />
        </div>

        {/* Statistics panel */}
        {showStatistics && (
          <div className="statistics-section">
            <DebateStatistics roomId={roomId} socket={socket} currentUser={currentUser} />
          </div>
        )}
      </div>

      {/* Thread modal */}
      {selectedThread && (
        <MessageThread
          message={messages.find((m) => m._id === selectedThread)}
          roomId={roomId}
          currentUser={currentUser}
          onClose={() => setSelectedThread(null)}
          onSendReply={handleSendReply}
          onAddReaction={handleAddReaction}
        />
      )}
    </div>
  );
}
```

### Step 2: Create ReplyForm Component

```jsx
// src/components/ReplyForm.jsx
import { useState } from 'react';

export default function ReplyForm({ parentId, onCancel, onSubmit }) {
  const [text, setText] = useState('');
  const [position, setPosition] = useState('neutral');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, position);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reply-form-main">
      <div className="reply-form-label">
        Replying to message #{parentId.slice(-4)}
      </div>

      <div className="reply-form-content">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your reply..."
          rows={2}
        />

        <div className="reply-controls">
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="pro">Pro</option>
            <option value="con">Con</option>
            <option value="neutral">Neutral</option>
          </select>

          <button type="submit" className="btn-send">
            Send Reply
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
```

### Step 3: Update ChatInput Component

```jsx
// Add position selector to your existing ChatInput
<div className="chat-input-position">
  <select value={position} onChange={(e) => setPosition(e.target.value)}>
    <option value="pro">🟢 Pro</option>
    <option value="con">🔴 Con</option>
    <option value="neutral">🟡 Neutral</option>
  </select>
</div>
```

### Step 4: Update CSS Layout

```css
/* Update DebateRoom.css */

.debate-room-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.debate-room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.debate-room-content {
  display: grid;
  grid-template-columns: 1fr;
  flex: 1;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.debate-room-content.with-stats {
  grid-template-columns: 1fr 400px;
}

.messages-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.statistics-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .debate-room-content.with-stats {
    grid-template-columns: 1fr;
  }

  .statistics-section {
    order: -1;
    max-height: 300px;
  }
}
```

## Data Flow Diagram

```
User Action → Socket Emit → Socket Handler → DB Update
                                   ↓
                         Real-time Broadcast → UI Update

Example: Adding Reaction
┌─────────────────┐
│ Click 👍 button │
└────────┬────────┘
         ↓
┌──────────────────────────────────┐
│ socket.emit('addReaction', {...})│
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ Server Socket Handler                    │
│ - room.addReaction(messageId, emoji, ...) │
│ - Save to database                        │
└────────┬─────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ io.to(roomId).emit('reactionAdded', {...})│
└────────┬─────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ Frontend Socket Listener                 │
│ - Update message in state                │
│ - Re-render MessageItem                  │
└──────────────────────────────────────────┘
```

## Error Handling

Add error handling for socket events:

```jsx
// In DebateRoom.jsx useEffect
if (socket) {
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    // Show user-friendly error message
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    // Show reconnection UI
  });
}
```

## Testing Workflow

1. **Single User Testing**:
   - Send message → Verify in chat
   - Click reaction → Verify appears
   - Edit own message → Verify shows "(edited)"
   - Delete own message → Verify removed

2. **Multi-User Testing** (Open 2 browser windows):
   - User A sends message
   - User B adds reaction
   - User A sees reaction in real-time
   - User A edits message
   - User B sees edited flag
   - User A pins message
   - Both see pin badge

3. **Thread Testing**:
   - Click "Reply" on message
   - Reply with different position
   - View thread modal
   - See all replies and reactions

4. **Statistics Testing**:
   - Toggle statistics panel
   - See real-time metric updates
   - Send multiple messages
   - Verify sentiment distribution
   - Check per-participant engagement

## Common Issues & Solutions

### Reactions not updating in real-time
**Solution**: Ensure Socket.IO connection is active. Check browser console for connection errors.

### Edit/Delete buttons not showing
**Solution**: Verify `message.userId === currentUser.id` check. Log currentUser in console.

### Sentiment not analyzing
**Solution**: Check server logs for sentimentService errors. Verify DebateRoom model has sentiment field.

### Statistics dashboard blank
**Solution**: Ensure room has messages. Check API response in network tab.

### Thread modal not showing
**Solution**: Verify selectedThread state updates. Check if message has replyCount > 0.

## Performance Optimization Tips

1. **Memoization**: Use `React.memo()` for MessageItem to prevent re-renders
2. **Virtual Scrolling**: For 1000+ messages, implement react-window
3. **Pagination**: Load messages in batches with scroll pagination
4. **Debouncing**: Debounce typing indicators (already done)
5. **Message Chunking**: Limit reaction picker to 8 emojis

## Next Integration Tasks

After completing this integration:
1. Add message search functionality
2. Implement @mention notifications
3. Add message translation for multilingual debates
4. Create moderation tools for debate managers
5. Build debate history/archive view
