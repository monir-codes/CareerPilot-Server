import { notificationRepository } from '../repositories/NotificationRepository';

export class NotificationService {
  async getNotificationById(id: string) {
    return notificationRepository.findById(id);
  }
}

export const notificationService = new NotificationService();
