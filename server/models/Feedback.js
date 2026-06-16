import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Bug Report', 'Feature Request', 'Suggestion', 'General Feedback'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    page: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Unknown',
    },
    status: {
      type: String,
      enum: ['Open', 'In Review', 'Planned', 'Completed', 'Rejected'],
      default: 'Open',
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Add index for fast querying by reference ID
feedbackSchema.index({ referenceId: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ priority: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
