import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  fullName: string;
  title: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent re-compiling model in Vercel hot reloads
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
