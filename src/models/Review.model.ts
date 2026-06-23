import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

reviewSchema.index({ isDeleted: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
