import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
  MESSAGE = 'MESSAGE'
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
