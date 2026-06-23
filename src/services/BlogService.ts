import { blogRepository } from '../repositories/BlogRepository';

export class BlogService {
  async getBlogById(id: string) {
    return blogRepository.findById(id);
  }
}

export const blogService = new BlogService();
