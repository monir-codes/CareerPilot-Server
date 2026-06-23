import { BaseRepository } from './BaseRepository';
import { Notification, INotification } from '../models/Notification.model';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}

export const notificationRepository = new NotificationRepository();
