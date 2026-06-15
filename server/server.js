import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import debateRoutes from './routes/debateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import pvpRoutes from './routes/pvpRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { initializeSocket } from './socket/socket.js';

dotenv.config();
console.info('Environment loaded:', {
  AI_API_KEY: !!process.env.AI_API_KEY,
  PORT: process.env.PORT || 5000,
});

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || [/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/],
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ArgueX backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/debates', debateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/pvp', pvpRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server that Express will use
    // This allows Socket.IO to work alongside Express
    const httpServer = createServer(app);

    // Initialize Socket.IO with HTTP server
    const io = initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║     🚀 ArgueX Backend Started Successfully              ║
╠════════════════════════════════════════════════════════╣
║ Express:   http://localhost:${PORT}${' '.repeat(29 - PORT.toString().length)}║
║ Socket.IO: ws://localhost:${PORT}${' '.repeat(29 - PORT.toString().length)}║
║ Database:  MongoDB Connected ✓${' '.repeat(26)}║
╚════════════════════════════════════════════════════════╝
      `);
    });

    // Make io globally accessible for controllers
    app.locals.io = io;
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

startServer();
