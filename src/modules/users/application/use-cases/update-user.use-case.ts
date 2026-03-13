import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

const SALT_ROUNDS = 10;

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    const data: Partial<{ name: string; password: string }> = {};

    if (dto.name) data.name = dto.name;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    const updated = await this.userRepository.update(id, data);
    if (!updated) throw new NotFoundException('User not found');

    return updated;
  }
}
