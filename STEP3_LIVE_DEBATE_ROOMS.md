# STEP 3 — LIVE DEBATE ROOMS COMPLETE ✓

## What We Built

A complete real-time multiplayer debate system with Socket.IO integration, database persistence, and React UI.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ DebateRoom.jsx (Main Container)                      │   │
│ │  ├─ Fetches room data from API                       │   │
│ │  ├─ Initializes Socket.IO connection               │   │
│ │  └─ Manages component state                          │   │
│ └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ChatWindow.jsx          │ ParticipantList.jsx        │   │
│ │ - Display messages      │ - Show participants       │   │
│ │ - Input field           │ - Track online status     │   │
│ │ - Typing indicators     │ - Room capacity           │   │
│ └──────────────────────────────────────────────────────┘   │
│                          ↕                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Socket.IO Client (socketService.js)                 │   │
│ │ - emit/listen events                                │   │
│ │ - Connection management                             │   │
│ └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                           ↕ WebSocket
┌────────────────────────────────────────────────────────────┐
│ BACKEND (Express + Socket.IO)                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Socket.IO Server (socket.js)                        │   │
│ │ - Authentication middleware                         │   │
│ │ - Room event handlers                               │   │
│ │ - Broadcasting to clients                           │   │
│ └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Room Controller (roomController.js)                 │   │
│ │ - createRoom, joinRoom, leaveRoom                   │   │
│ │ - addMessage, getRoomMessages                       │   │
│ │ - startRoom, endRoom                                │   │
│ └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ MongoDB                                              │   │
│ │ - DebateRoom model (rooms, participants, messages)  │   │
│ │ - Debate model (updated with roomId)                │   │
│ └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## Files Created

### Backend

#### 1. **server/models/DebateRoom.js**
```javascript
New model with:
- roomId: Unique socket room identifier
- debate: Reference to Debate
- creator: User who created room
- participants: Array of users + join/leave timestamps
- messages: Array of debate messages with metadata
- status: waiting → active → ended
- maxParticipants: Configurable (default 2)

Methods:
- addMessage() - Add message + increment counter
- addParticipant() - Add user to room
- removeParticipant() - Remove user, mark as left
- getActiveParticipants() - Filter active only
- isFull() - Check if room at capacity
- endRoom() - Mark room as ended
```

#### 2. **server/controllers/roomController.js**
```javascript
API endpoints:
- createRoom(POST) - Create new debate room
- joinRoom(POST) - User joins existing room
- getRoom(GET) - Fetch room details
- getRoomMessages(GET) - Get messages with pagination
- addMessageToRoom(POST) - Save message to DB
- leaveRoom(POST) - User leaves room
- startRoom(POST) - Transition to active (creator only)
- endRoom(POST) - End debate, save transcript
- getUserRooms(GET) - User's active rooms
```

#### 3. **server/routes/roomRoutes.js**
```javascript
REST API routes:
POST   /api/rooms/create
POST   /api/rooms/:roomId/join
GET    /api/rooms/:roomId
GET    /api/rooms/:roomId/messages
POST   /api/rooms/:roomId/messages
POST   /api/rooms/:roomId/leave
POST   /api/rooms/:roomId/start
POST   /api/rooms/:roomId/end
GET    /api/rooms/user/active

All protected by JWT authentication
```

#### 4. **server/socket/socket.js** (Updated)
```javascript
Enhanced with:
- DebateRoom import
- debateMessage handler now saves to DB
- Async/await for database operations
- Error handling for message persistence
```

#### 5. **server/server.js** (Updated)
```javascript
Changes:
- Import roomRoutes
- Register /api/rooms route
```

### Frontend

#### 1. **src/components/ChatWindow.jsx**
```javascript
Features:
- Display real-time messages
- Message input with position selector (pro/con/neutral)
- Typing indicators
- Auto-scroll to latest message
- Message styling: own message vs others
- Time stamps for each message
```

#### 2. **src/components/ParticipantList.jsx**
```javascript
Features:
- Show all participants
- Status indicators (online, inactive, left)
- Join time tracking
- "YOU" badge for current user
- Room stats (active/capacity)
- Color coding for status
```

#### 3. **src/components/DebateRoom.jsx**
```javascript
Main container component:
- Fetch room data from API
- Initialize Socket.IO connection
- Manage messages, participants, typing users
- Handle message sending
- Handle room leave/end
- Integrate with ChatWindow + ParticipantList
```

#### 4. **src/services/socketService.js** (Already created in STEP 2)

#### 5. **src/hooks/useSocket.js** (Already created in STEP 2)

### Styles

#### 1. **src/styles/ChatWindow.css**
```
- Message container
- Own vs other message styling
- Typing indicator animation
- Input form styling
- Scrollbar customization
```

#### 2. **src/styles/ParticipantList.css**
```
- Participant item styling
- Status color coding
- Join time display
- Room stats display
```

#### 3. **src/styles/DebateRoom.css**
```
- Full-screen layout
- Header with controls
- Two-column layout (chat + participants)
- Responsive design
- Button styling
```

### Routes

#### Updated **src/App.jsx**
```javascript
Added route:
<Route path="room/:roomId" element={<ProtectedRoute><DebateRoom /></ProtectedRoute>} />
```

---

## Real-Time Flow: Complete Journey

### 1️⃣ CREATE ROOM
```
User clicks "Start Live Debate"
         ↓
Frontend: POST /api/rooms/create
  { debateId, topic, position }
         ↓
Backend creates DebateRoom document
Backend returns roomId
         ↓
Frontend: navigate to /room/:roomId
```

### 2️⃣ ROOM INITIALIZATION
```
React mounts DebateRoom component
         ↓
Fetch room details: GET /api/rooms/:roomId
Fetch messages: GET /api/rooms/:roomId/messages
         ↓
Socket.IO connects with JWT auth
         ↓
Emit: socket.emit('joinRoom', { roomId })
         ↓
Server: socket.join(roomId)
         ↓
Server broadcasts: io.to(roomId).emit('userJoined', {...})
         ↓
All participants see "User X joined"
```

### 3️⃣ LIVE MESSAGE EXCHANGE
```
User A types message in ChatWindow
         ↓
onSendMessage() called
         ↓
socket.emit('debateMessage', {
  message: "...",
  roomId: "...",
  position: "pro"
})
         ↓
Server receives event
         ↓
Find DebateRoom by roomId
await room.addMessage(...)
         ↓
io.to(roomId).emit('debateMessage', {
  userId, userName, message, position, timestamp
})
         ↓
Save to database ✓
         ↓
Broadcast to room ✓
         ↓
User A receives (instant)
User B receives (instant)
User C receives (instant)
         ↓
Messages rendered in ChatWindow
⏱️ Total latency: ~50-100ms
```

### 4️⃣ TYPING INDICATORS
```
User A starts typing in input
         ↓
onInputChange triggers
         ↓
socket.emit('userTyping', { roomId })
         ↓
Server: socket.broadcast.to(roomId).emit(...)
         ↓
User B & C see: "User A is typing..."
         ↓
After 2 seconds of inactivity
         ↓
socket.emit('userStoppedTyping', { roomId })
         ↓
Typing indicator disappears
```

### 5️⃣ END DEBATE
```
Room creator clicks "End Debate"
         ↓
POST /api/rooms/:roomId/end
         ↓
Backend marks room as 'ended'
Backend saves transcript to Debate model
         ↓
io.to(roomId).emit('debateEnded', ...)
         ↓
All participants see "Debate ended"
         ↓
setTimeout(() => navigate('/dashboard'), 2000)
```

---

## Database Schema

### DebateRoom Collection
```javascript
{
  _id: ObjectId,
  debate: ObjectId (ref Debate),
  roomId: "debate_61234567890_1625097600000",
  creator: ObjectId (ref User),
  participants: [
    {
      user: ObjectId (ref User),
      joinedAt: Date,
      leftAt: Date (null if still active),
      status: "active" | "inactive" | "left"
    },
    ...
  ],
  messages: [
    {
      userId: ObjectId,
      userName: "alice",
      message: "AI should be regulated",
      position: "pro" | "con" | "neutral",
      timestamp: Date
    },
    ...
  ],
  status: "waiting" | "active" | "ended",
  startedAt: Date (null until started),
  endedAt: Date (null until ended),
  maxParticipants: 2,
  maxDuration: 3600,
  topic: "Should AI be regulated?",
  position: "pro",
  isPublic: false,
  allowSpectators: true,
  messageCount: 42,
  viewCount: 10,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Event Flow Reference

### Socket Events

| Event | From | To | Data |
|-------|------|-----|------|
| `joinRoom` | Client | Server | { roomId } |
| `leaveRoom` | Client | Server | { roomId } |
| `debateMessage` | Client | Server | { message, roomId, position } |
| `userTyping` | Client | Server | { roomId } |
| `userStoppedTyping` | Client | Server | { roomId } |
| `userJoined` | Server | Room | { userId, userName, roomId } |
| `userLeft` | Server | Room | { userId, userName, roomId } |
| `debateMessage` | Server | Room | { userId, userName, message, position, timestamp } |
| `userTyping` | Server | Room(others) | { userId, userName, roomId } |
| `userStoppedTyping` | Server | Room(others) | { userId, roomId } |
| `roomState` | Server | Client | { roomId, usersInRoom, userCount } |

---

## Testing the Live Debate Room

### 1. Start Backend & Database
```bash
# Terminal 1: Backend
cd server
npm run dev

# Should see:
# ✓ ArgueX Backend Started Successfully
# MongoDB Connected
```

### 2. Start Frontend
```bash
# Terminal 2: Frontend
npm run dev

# http://localhost:5173
```

### 3. Test Flow

**Step A: Create Room**
1. Login as User A
2. Go to Dashboard
3. Create or select a debate
4. Click "Start Live Debate" button (you'll create this)
5. Frontend creates room via POST /api/rooms/create
6. Redirects to /room/:roomId

**Step B: Join as User B**
1. Open another browser/incognito window
2. Login as User B
3. Navigate to same /room/:roomId
4. Backend adds User B to participants

**Step C: Send Messages**
1. User A sends: "AI needs regulation"
2. See message appear instantly for both
3. User B types...
4. See "User B is typing..." indicator
5. User B sends: "Disagree, market will self-regulate"
6. Both see conversation in real-time

**Step D: End Debate**
1. User A clicks "End Debate"
2. Room marked as ended
3. Transcript saved to database
4. Both redirect to dashboard

---

## Component Integration Flow

```
App.jsx
  ↓
<Route path="room/:roomId" />
  ↓
DebateRoom.jsx (Container)
  ├─ State: messages, participants, typingUsers, roomStatus
  ├─ Effects: 
  │  ├─ Fetch room data
  │  ├─ Setup Socket listeners
  │  └─ Cleanup on unmount
  │
  ├─ Handlers:
  │  ├─ handleSendMessage()
  │  ├─ handleTyping()
  │  ├─ handleEndDebate()
  │  └─ handleLeaveDebate()
  │
  └─ Render:
     ├─ ChatWindow
     │  ├─ Input: sendMessage, position select
     │  ├─ Display: messages with formatting
     │  └─ Indicators: typing status
     │
     └─ ParticipantList
        ├─ Show: all participants, status
        ├─ Stats: active/capacity ratio
        └─ Metadata: join times
```

---

## Next Steps (STEP 4)

Now that we have live debate rooms, STEP 4 will enhance the real-time chat system with:

1. **Message Persistence**
   - Load previous messages when joining
   - Pagination for large message histories
   - Message editing/deletion

2. **Advanced Features**
   - Message reactions (👍, 👎, 💯)
   - Threaded replies
   - Message search

3. **Chat Enhancements**
   - Emoji support
   - Message formatting (bold, italic)
   - Code block support for arguments
   - Link previews

4. **Integration**
   - Save message sentiment analysis
   - Track argument strength
   - Generate debate summary

This completes the real-time multiplayer debate foundation! Ready for STEP 4? 🚀
