import mongoose, { Schema, Document } from 'mongoose';

export interface IAIHistory extends Document {
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const aihistorySchema = new Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

aihistorySchema.index({ isDeleted: 1 });

export const AIHistory = mongoose.model<IAIHistory>('AIHistory', aihistorySchema);
