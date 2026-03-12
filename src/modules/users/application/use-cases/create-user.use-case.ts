import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

const SALT_ROUNDS = 10;

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Fail-fast: entity validates email format and password strength
    const user = new User(dto.name, dto.email, dto.password);

    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const userToSave = new User(user.name, user.email, hashedPassword);

    return this.userRepository.create(userToSave);
  }
}
