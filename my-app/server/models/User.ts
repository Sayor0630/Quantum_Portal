import mongoose, { Document, Schema, models } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  hashedPassword?: string; // Optional because it might not be selected in every query
  roles: ('admin' | 'customer')[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  hashedPassword: { type: String, required: true, select: false }, // select: false by default
  roles: [{ type: String, enum: ['admin', 'customer'], default: ['customer'] }],
}, { timestamps: true });

// Avoid recompiling the model if it already exists
export default models.User || mongoose.model<IUser>('User', UserSchema);
