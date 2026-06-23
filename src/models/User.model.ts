import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  fullName?: string;
  title?: string;
  bio?: string;
  role: UserRole;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String },
  title: { type: String },
  bio: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ clerkId: 1 });
userSchema.index({ isDeleted: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
