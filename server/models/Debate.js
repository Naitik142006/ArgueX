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
    aiPersona: {
      type: String,
      default: 'einstein',
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    analysis: {
      logicScore: Number,
      evidenceScore: Number,
      persuasionScore: Number,
      summary: String,
      fallacies: [
        {
          name: String,
          explanation: String,
        }
      ],
      feedback: String,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Debate = mongoose.model('Debate', debateSchema);
export default Debate;
