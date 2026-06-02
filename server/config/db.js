import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.warn('MONGO_URI not set — skipping MongoDB connection (running in socket-only mode)');
      return Promise.resolve();
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.warn('Continuing without MongoDB for smoke-testing (database features will be limited).');
    return Promise.resolve();
  }
};

export default connectDB;
