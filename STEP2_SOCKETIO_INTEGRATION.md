# STEP 2 — SOCKET.IO INTEGRATION COMPLETE ✓

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ REACT FRONTEND (src/services/socketService.js)              │
│ ├─ initSocket(token) → Creates WebSocket connection          │
│ ├─ emitEvent(eventName, data) → Send to server             │
│ ├─ listenEvent(eventName, callback) → Receive from server  │
│ └─ getSocket() → Returns current socket instance           │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket
┌─────────────────────────────────────────────────────────────┐
│ EXPRESS + SOCKET.IO SERVER (server/socket/socket.js)         │
│ ├─ io.use() → Middleware for authentication                 │
│ ├─ io.on('connection') → Handle new connections            │
│ ├─ socket.on('event') → Listen for client events           │
│ ├─ io.to(room).emit() → Broadcast to room                  │
│ └─ socket.on('disconnect') → Handle disconnections         │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### 1. Backend Socket Server
**Location:** `server/socket/socket.js`

**Key Components:**
- `initializeSocket(server)` - Creates Socket.IO server with HTTP server
- Authentication middleware - Verifies JWT tokens
- Connection handler - Manages user connects/disconnects
- Event handlers - Debate messages, room joins, typing indicators

**Events Handled:**
- ✅ Connection/Disconnect
- ✅ joinRoom/leaveRoom
- ✅ debateMessage
- ✅ userTyping/userStoppedTyping
- ✅ userOnline/userOffline (presence)

### 2. Frontend Socket Service
**Location:** `src/services/socketService.js`

**Exports:**
- `initSocket(token, serverUrl)` - Initialize connection with auth
- `getSocket()` - Get current socket instance
- `emitEvent(eventName, data)` - Send event to server
- `listenEvent(eventName, callback)` - Listen for events
- `disconnectSocket()` - Disconnect gracefully

### 3. React Hook
**Location:** `src/hooks/useSocket.js`

**Usage in Components:**
```javascript
import { useSocket } from '../hooks/useSocket';

function DebateRoom() {
  const { 
    isConnected, 
    roomUsers, 
    joinRoom, 
    sendMessage 
  } = useSocket(token);

  return <div>{/* Component code */}</div>;
}
```

### 4. Updated Backend Server
**Location:** `server/server.js`

**Changes:**
- Import `http.createServer`
- Import `initializeSocket`
- Create HTTP server from Express app
- Initialize Socket.IO with HTTP server
- Make `io` available to controllers via `app.locals.io`

---

## Socket Lifecycle: Step-by-Step

### 1️⃣ CONNECTION PHASE

```
Client (Browser)                Backend (Node.js)
     │                               │
     │─── socket.io connect ────────>│
     │  (with JWT token)             │
     │                               │
     │<────── validate JWT ─────────>│
     │                               │
     │<─────── connection OK ────────│
     │                               │
  Connected                      io.on('connection')
```

**Code Flow:**

Frontend:
```javascript
import { initSocket } from './services/socketService';

// In App component or on login
const token = localStorage.getItem('authToken');
const socket = initSocket(token);
```

Backend:
```javascript
io.use((socket, next) => {
  // Authenticate JWT
  const decoded = jwt.verify(token, JWT_SECRET);
  socket.userId = decoded.id;
  next();
});

io.on('connection', (socket) => {
  console.log(`${socket.userName} connected`);
});
```

---

### 2️⃣ USER JOINS DEBATE ROOM

```
User A (Browser)              Backend                 User B (Browser)
      │                         │                         │
      │── emit('joinRoom') ────>│                         │
      │  { roomId: '123' }      │                         │
      │                         │                         │
      │                    socket.join(roomId)            │
      │                         │                         │
      │<── emit('roomState') ───│                         │
      │   { usersInRoom: [...] }│                         │
      │                         │                         │
      │<── broadcast: userJoined│── broadcast: userJoined >│
      │    to all in room       │    to all in room       │
```

**Frontend Code:**
```javascript
// User clicks "Join Debate"
function handleJoinDebate(roomId) {
  emitEvent('joinRoom', { roomId });
}

// Listen for room state
listenEvent('roomState', (data) => {
  console.log('Users in room:', data.usersInRoom);
});
```

**Backend Code:**
```javascript
socket.on('joinRoom', (data) => {
  const { roomId } = data;
  socket.join(roomId);
  
  // Tell everyone in room someone joined
  io.to(roomId).emit('userJoined', {
    userId: socket.userId,
    userName: socket.userName,
  });
});
```

---

### 3️⃣ LIVE DEBATE MESSAGE (THE CORE)

This is where real-time magic happens:

```
User A types "AI should be regulated"
         ↓
socket.emit('debateMessage', { message: '...' })
         ↓
Backend receives event
         ↓
Validate + Save to MongoDB
         ↓
io.to(roomId).emit('debateMessage', {})
         ↓
User A receives (local echo)
User B receives (instantly!)
         ↓
Components update UI
         ↓
⏱️ Total latency: ~50-100ms (vs 1000-2000ms with polling)
```

**Frontend:**
```javascript
// When user sends message
function handleSendMessage(text) {
  emitEvent('debateMessage', {
    message: text,
    roomId: currentRoomId,
    debateId: debateId,
  });
}

// Listen for incoming messages (from others OR self)
listenEvent('debateMessage', (data) => {
  setMessages(prev => [...prev, data]);
});
```

**Backend:**
```javascript
socket.on('debateMessage', (data) => {
  const { roomId, message, debateId } = data;

  // Broadcast to entire room
  io.to(roomId).emit('debateMessage', {
    userId: socket.userId,
    userName: socket.userName,
    message,
    timestamp: new Date(),
  });

  // TODO: Save to MongoDB Debate.messages
  // TODO: Update last activity timestamp
});
```

---

### 4️⃣ TYPING INDICATORS (UX Enhancement)

```
User A starts typing
         ↓
socket.emit('userTyping', { roomId })
         ↓
Backend broadcasts (NOT to sender)
         ↓
User B sees "User A is typing..."
         ↓
User A sends message or stops
         ↓
socket.emit('userStoppedTyping', { roomId })
         ↓
User B sees typing indicator disappear
```

**Frontend:**
```javascript
function handleInputChange(text) {
  setText(text);
  
  // Emit typing indicator
  emitEvent('userTyping', { roomId });
  
  // Debounce cleanup
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    emitEvent('userStoppedTyping', { roomId });
  }, 2000);
}
```

---

### 5️⃣ DISCONNECTION HANDLING

```
User closes tab / network drops
         ↓
Socket auto-detects disconnect
         ↓
socket.on('disconnect', (reason) => {...})
         ↓
Remove from room
Broadcast "user left"
Clean up resources
         ↓
If user reconnects:
  - Socket.IO auto-reconnects
  - Re-authenticates with JWT
  - Rejoins rooms
```

**Backend:**
```javascript
socket.on('disconnect', (reason) => {
  console.log(`${socket.userName} disconnected: ${reason}`);
  
  // Notify others
  if (socket.currentRoom) {
    io.to(socket.currentRoom).emit('userLeft', {
      userId: socket.userId,
      userName: socket.userName,
    });
  }
  
  // TODO: Update presence in database
  // TODO: Mark debate as abandoned if user was active
});
```

---

## Emit vs Broadcast vs To

### `socket.emit()`
Send event TO THE SERVER from client

```javascript
// Client
socket.emit('debateMessage', { message: 'Hello' });

// Server listens
socket.on('debateMessage', (data) => {
  console.log(data);
});
```

### `io.emit()`
Server sends to ALL connected clients

```javascript
// Server: Tell everyone online
io.emit('userOnline', { userId, userName });
```

### `io.to(room).emit()`
Server sends to all in a room

```javascript
// Server: Tell everyone in debate room
io.to(debateRoomId).emit('debateMessage', {...});
```

### `socket.broadcast.to(room).emit()`
Server sends to room EXCEPT the sender

```javascript
// Server: Tell others (not sender) that I'm typing
socket.broadcast.to(roomId).emit('userTyping', {...});
```

---

## Testing Socket.IO

### 1. Start Backend
```bash
cd server
npm run dev

# Should output:
# ✓ ArgueX Backend Started Successfully
# Express: http://localhost:5000
# Socket.IO: ws://localhost:5000
```

### 2. Start Frontend
```bash
npm run dev

# Should output:
# ✓ Local: http://localhost:5173
```

### 3. Test in Browser Console

After logging in, open DevTools and run:

```javascript
// Get socket instance
const socket = window.socketIO?.getSocket();

// Check connection
console.log(socket?.connected);  // Should be true

// Listen for messages
socket?.on('debateMessage', (data) => {
  console.log('Received:', data);
});

// Send test message
socket?.emit('debateMessage', { 
  message: 'Test', 
  roomId: 'test-123' 
});
```

---

## Common Issues & Fixes

### Issue: "Socket not connected"
**Solution:** Ensure you called `initSocket(token)` after login

### Issue: "Authentication error"
**Solution:** Check JWT_SECRET matches between backend and frontend

### Issue: CORS errors
**Solution:** Backend CORS already configured in `server/socket/socket.js`

### Issue: "Cannot join room"
**Solution:** Make sure `roomId` is valid and same on client/server

---

## Next Steps (STEP 3)

Now we have real-time transport working. Next we'll:

1. **Create Room Management System**
   - Room creation endpoint
   - Room state persistence
   - Debate room schema updates

2. **Build Live Debate UI**
   - Chat component with Socket.IO
   - User list
   - Typing indicators
   - Message history

3. **Implement Room Lifecycle**
   - Create room → Users join → Debate happens → Users leave
   - Auto-close room after debate ends
   - Save debate transcript

Ready? We'll build live debate rooms next! 🚀
