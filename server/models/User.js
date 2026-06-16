import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    rank: {
      type: String,
      default: 'Bronze',
    },
    eloRating: {
      type: Number,
      default: 1000,
    },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    lastDebateDate: { type: Date, default: null },
    achievements: [{
      title: String,
      unlockedAt: { type: Date, default: Date.now },
      icon: String
    }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
