import { bookmarkRepository } from '../repositories/BookmarkRepository';

export class BookmarkService {
  async getBookmarkById(id: string) {
    return bookmarkRepository.findById(id);
  }
}

export const bookmarkService = new BookmarkService();
