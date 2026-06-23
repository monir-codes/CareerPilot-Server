import { aihistoryRepository } from '../repositories/AIHistoryRepository';

export class AIHistoryService {
  async getAIHistoryById(id: string) {
    return aihistoryRepository.findById(id);
  }
}

export const aihistoryService = new AIHistoryService();
