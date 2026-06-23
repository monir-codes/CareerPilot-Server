import { userRepository } from '../repositories/UserRepository';

export class UserService {
  async getUserById(id: string) {
    return userRepository.findById(id);
  }
}

export const userService = new UserService();
