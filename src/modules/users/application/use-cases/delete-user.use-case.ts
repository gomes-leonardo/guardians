import { NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    await this.userRepository.softDelete(id);
  }
}
