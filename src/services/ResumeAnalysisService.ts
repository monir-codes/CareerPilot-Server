import { resumeanalysisRepository } from '../repositories/ResumeAnalysisRepository';

export class ResumeAnalysisService {
  async getResumeAnalysisById(id: string) {
    return resumeanalysisRepository.findById(id);
  }
}

export const resumeanalysisService = new ResumeAnalysisService();
