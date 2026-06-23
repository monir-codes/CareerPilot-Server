import { BaseRepository } from './BaseRepository';
import { Review, IReview } from '../models/Review.model';

export class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(Review);
  }
}

export const reviewRepository = new ReviewRepository();
