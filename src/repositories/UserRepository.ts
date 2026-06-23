import { BaseRepository } from './BaseRepository';
import { User, IUser } from '../models/User.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
