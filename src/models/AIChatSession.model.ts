import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface IAIChatSession extends Document {
  clerkUserId: string;
  title: string;
  topic?: string;
  details?: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const aiChatSessionSchema = new Schema({
  clerkUserId: { type: String, required: true, index: true },
  title: { type: String, default: 'New Conversation' },
  topic: { type: String },
  details: { type: String },
  messages: [messageSchema],
}, {
  timestamps: true
});

export const AIChatSession = mongoose.model<IAIChatSession>('AIChatSession', aiChatSessionSchema);
