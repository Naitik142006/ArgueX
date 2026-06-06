import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Debate from '../models/Debate.js';
import DebateRoom from '../models/DebateRoom.js';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/arguex';

async function seed() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  const existing = await User.findOne({ email: 'seed@arguex.local' });
  if (existing) {
    console.log('Seed user already exists. Exiting.');
    process.exit(0);
  }

  const user = await User.create({ username: 'seeduser', email: 'seed@arguex.local', password: 'password123' });
  const debate = await Debate.create({ user: user._id, topic: 'Is AI beneficial for society?' });
  const room = await DebateRoom.create({ debate: debate._id, creator: user._id, topic: debate.topic });

  console.log('Seed created:', { user: user._id.toString(), debate: debate._id.toString(), room: room.roomId });
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
