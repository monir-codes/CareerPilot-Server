import { BaseRepository } from './BaseRepository';
import { AIHistory, IAIHistory } from '../models/AIHistory.model';

export class AIHistoryRepository extends BaseRepository<IAIHistory> {
  constructor() {
    super(AIHistory);
  }
}

export const aihistoryRepository = new AIHistoryRepository();
