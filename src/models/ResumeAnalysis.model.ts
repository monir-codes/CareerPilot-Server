import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
  clerkUserId: string;
  score: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const resumeanalysisSchema = new Schema({
  clerkUserId: { type: String, required: true, index: true },
  score: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

resumeanalysisSchema.index({ isDeleted: 1 });

export const ResumeAnalysis = mongoose.model<IResumeAnalysis>('ResumeAnalysis', resumeanalysisSchema);
