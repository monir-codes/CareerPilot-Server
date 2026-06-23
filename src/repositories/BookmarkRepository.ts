import { BaseRepository } from './BaseRepository';
import { Bookmark, IBookmark } from '../models/Bookmark.model';

export class BookmarkRepository extends BaseRepository<IBookmark> {
  constructor() {
    super(Bookmark);
  }
}

export const bookmarkRepository = new BookmarkRepository();
