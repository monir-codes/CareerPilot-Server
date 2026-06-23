import { interviewsessionRepository } from '../repositories/InterviewSessionRepository';

export class InterviewSessionService {
  async getInterviewSessionById(id: string) {
    return interviewsessionRepository.findById(id);
  }
}

export const interviewsessionService = new InterviewSessionService();
