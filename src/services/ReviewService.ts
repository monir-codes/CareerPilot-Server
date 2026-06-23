import { reviewRepository } from '../repositories/ReviewRepository';

export class ReviewService {
  async getReviewById(id: string) {
    return reviewRepository.findById(id);
  }
}

export const reviewService = new ReviewService();
