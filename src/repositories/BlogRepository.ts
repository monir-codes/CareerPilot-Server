import { BaseRepository } from './BaseRepository';
import { Blog, IBlog } from '../models/Blog.model';

export class BlogRepository extends BaseRepository<IBlog> {
  constructor() {
    super(Blog);
  }
}

export const blogRepository = new BlogRepository();
