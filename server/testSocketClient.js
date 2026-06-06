import jwt from 'jsonwebtoken';
import { io } from 'socket.io-client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a test token payload
const payload = {
  id: '000000000000000000000001',
  email: 'test@example.com',
  name: 'TestUser',
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

// For smoke tests we intentionally omit token to exercise dev bypass
const socket = io('http://localhost:5000', {
  reconnectionDelayMax: 10000,
});

socket.on('connect', () => {
  console.log('Connected to socket server', socket.id);

  const roomId = 'smoke_test_room';

  socket.emit('joinRoom', { roomId });

  socket.emit('debateMessage', {
    roomId,
    message: 'Hello from smoke test client. This message should be analyzed for sentiment.',
    debateId: null,
    position: 'neutral',
  });
});

socket.on('debateMessage', (data) => {
  console.log('Received debateMessage:', data);
  // After receiving, close
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 500);
});

socket.on('connect_error', (err) => {
  console.error('Connect error', err.message);
  process.exit(1);
});

socket.on('error', (err) => {
  console.error('Socket error from server:', err);
});
