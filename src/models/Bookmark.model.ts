import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  clerkUserId: string;
  careerId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema({
  clerkUserId: { type: String, required: true, index: true },
  careerId: { type: Schema.Types.ObjectId, ref: 'CareerPath', required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

bookmarkSchema.index({ clerkUserId: 1, careerId: 1 }, { unique: true });
bookmarkSchema.index({ isDeleted: 1 });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
