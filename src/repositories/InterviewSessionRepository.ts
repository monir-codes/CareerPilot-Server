import { BaseRepository } from './BaseRepository';
import { InterviewSession, IInterviewSession } from '../models/InterviewSession.model';

export class InterviewSessionRepository extends BaseRepository<IInterviewSession> {
  constructor() {
    super(InterviewSession);
  }
}

export const interviewsessionRepository = new InterviewSessionRepository();
