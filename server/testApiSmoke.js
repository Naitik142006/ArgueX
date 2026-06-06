const base = 'http://localhost:5000';
const email = `smoke${Date.now()}@arguex.local`;
const password = 'Test1234!';
const headers = { 'Content-Type': 'application/json' };

const log = (label, data) => {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
};

const run = async () => {
  const signupRes = await fetch(`${base}/api/auth/signup`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ username: 'smoketest', email, password }),
  });
  const signup = await signupRes.json();
  log('signup', { status: signupRes.status, body: signup });

  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();
  log('login', { status: loginRes.status, body: login });

  const token = login.token;
  if (!token) {
    throw new Error('Login failed, no token');
  }

  const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

  const createDebateRes = await fetch(`${base}/api/debates`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ topic: 'Is remote work better than office work?' }),
  });
  const debate = await createDebateRes.json();
  log('createDebate', { status: createDebateRes.status, body: debate });

  const debateId = debate._id || debate.id;
  const createRoomRes = await fetch(`${base}/api/rooms/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ debateId, topic: 'Remote vs Office', position: 'neutral' }),
  });
  const room = await createRoomRes.json();
  log('createRoom', { status: createRoomRes.status, body: room });

  const roomId = room.room?.roomId;
  const addMessageRes = await fetch(`${base}/api/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ message: 'Hello from the API smoke test', position: 'neutral' }),
  });
  const addedMessage = await addMessageRes.json();
  log('addMessageToRoom', { status: addMessageRes.status, body: addedMessage });

  const roomMessagesRes = await fetch(`${base}/api/rooms/${roomId}/messages`, {
    headers: authHeaders,
  });
  const roomMessages = await roomMessagesRes.json();
  log('roomMessages', { status: roomMessagesRes.status, body: roomMessages });

  const messageId = roomMessages.messages[0]?._id;
  if (!messageId) {
    throw new Error('No message ID available');
  }

  const replyRes = await fetch(`${base}/api/chat/rooms/${roomId}/threads/${messageId}/reply`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ message: 'This is a threaded reply', position: 'neutral' }),
  });
  const reply = await replyRes.json();
  log('replyToMessage', { status: replyRes.status, body: reply });

  const reactionRes = await fetch(`${base}/api/chat/rooms/${roomId}/reactions/add`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ messageId, reaction: '👍' }),
  });
  const reaction = await reactionRes.json();
  log('addReaction', { status: reactionRes.status, body: reaction });

  const statsRes = await fetch(`${base}/api/chat/rooms/${roomId}/statistics`, {
    headers: authHeaders,
  });
  const stats = await statsRes.json();
  log('getDebateStatistics', { status: statsRes.status, body: stats });

  const pinnedRes = await fetch(`${base}/api/chat/rooms/${roomId}/messages/${messageId}/pin`, {
    method: 'POST',
    headers: authHeaders,
  });
  const pinned = await pinnedRes.json();
  log('pinMessage', { status: pinnedRes.status, body: pinned });

  const pinnedListRes = await fetch(`${base}/api/chat/rooms/${roomId}/pinned`, {
    headers: authHeaders,
  });
  const pinnedList = await pinnedListRes.json();
  log('getPinnedMessages', { status: pinnedListRes.status, body: pinnedList });

  console.log('\nSmoke test complete.');
};

run().catch(err => {
  console.error('Smoke test error:', err.message);
  process.exit(1);
});
