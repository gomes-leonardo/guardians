import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(
    id: string,
    data: Partial<{ name: string; password: string }>,
  ): Promise<User | null>;
  softDelete(id: string): Promise<void>;
}

export const IUserRepository = Symbol('IUserRepository');
