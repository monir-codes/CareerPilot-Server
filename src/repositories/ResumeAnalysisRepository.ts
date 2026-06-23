import { BaseRepository } from './BaseRepository';
import { ResumeAnalysis, IResumeAnalysis } from '../models/ResumeAnalysis.model';

export class ResumeAnalysisRepository extends BaseRepository<IResumeAnalysis> {
  constructor() {
    super(ResumeAnalysis);
  }
}

export const resumeanalysisRepository = new ResumeAnalysisRepository();
