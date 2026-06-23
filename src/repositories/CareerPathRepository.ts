import { BaseRepository } from './BaseRepository';
import { CareerPath, ICareerPath } from '../models/CareerPath.model';

export class CareerPathRepository extends BaseRepository<ICareerPath> {
  constructor() {
    super(CareerPath);
  }
}

export const careerpathRepository = new CareerPathRepository();
