import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI;
let cached = (global as typeof globalThis & { mongooseCache?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongooseCache;
if (!cached) cached = (global as typeof globalThis & { mongooseCache?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongooseCache = { conn: null, promise: null };
export async function connectDb() {
  if (!uri) throw new Error('MongoDB is not configured. Add MONGODB_URI on the server.');
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) cached!.promise = mongoose.connect(uri, { bufferCommands: false });
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
