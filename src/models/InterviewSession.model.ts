import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSession extends Document {
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const interviewsessionSchema = new Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

interviewsessionSchema.index({ isDeleted: 1 });

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', interviewsessionSchema);
