import { careerpathRepository } from '../repositories/CareerPathRepository';

export class CareerPathService {
  async getCareerPathById(id: string) {
    return careerpathRepository.findById(id);
  }
}

export const careerpathService = new CareerPathService();
