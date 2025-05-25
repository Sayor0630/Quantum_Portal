import mongoose from 'mongoose';

// Ensure this matches the .env.local.example or your actual .env.local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_platform_dev_placeholder';

if (!MONGODB_URI) {
  // This error should ideally be caught before deployment if MONGODB_URI is essential.
  // For local development, the placeholder allows the app to run without a .env.local file.
  console.warn(
    'MONGODB_URI is not defined. Using default placeholder. Please define the MONGODB_URI environment variable inside .env.local for a persistent connection.'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Type assertion for global.mongoose
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('MongoDB: Using cached connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering if you want operations to fail fast if not connected
      // useNewUrlParser: true, // Deprecated but often in older examples
      // useUnifiedTopology: true, // Deprecated but often in older examples
    };

    // Only log the URI in development or if explicitly allowed, to avoid leaking sensitive info.
    // console.log(`MongoDB: Attempting to connect to ${MONGODB_URI.startsWith('mongodb://localhost') ? MONGODB_URI : 'a non-localhost URI'}`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB: New connection established.');
      return mongooseInstance;
    }).catch(error => {
      console.error('MongoDB: Initial connection error:', error);
      cached.promise = null; // Reset promise on error
      throw error; // Re-throw to be caught by the caller or outer try/catch
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the promise was rejected, nullify it to allow for a new attempt next time.
    cached.promise = null; 
    console.error('MongoDB: Connection promise error:', e);
    throw e; // Re-throw the error to be handled by the caller
  }

  if (!cached.conn) {
    // This case should ideally not be reached if errors are thrown correctly above.
    throw new Error("MongoDB: Connection failed and was not established.");
  }

  return cached.conn;
}

export default dbConnect;

// TypeScript declaration for the global mongoose cache.
// This ensures that TypeScript understands the structure of `global.mongoose`.
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}
