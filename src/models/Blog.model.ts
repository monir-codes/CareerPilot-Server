import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

blogSchema.index({ isDeleted: 1 });

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
