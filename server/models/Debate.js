import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const debateSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'Debate topic is required'],
      trim: true,
    },
    opponent: {
      type: String,
      default: 'ArgueX AI Coach',
    },
    scores: {
      user: {
        type: Number,
        default: 0,
      },
      opponent: {
        type: Number,
        default: 0,
      },
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Debate = mongoose.model('Debate', debateSchema);
export default Debate;
