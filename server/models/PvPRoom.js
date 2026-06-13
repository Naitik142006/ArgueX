import mongoose from 'mongoose';

const pvpRoomSchema = mongoose.Schema(
  {
    roomCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
      uppercase: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed'],
      default: 'waiting',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '1h' }, // Automatically delete room after 1 hour of inactivity
    },
  },
  {
    timestamps: true,
  }
);

const PvPRoom = mongoose.model('PvPRoom', pvpRoomSchema);
export default PvPRoom;
