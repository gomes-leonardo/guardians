import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new UpdateUserUseCase(mockRepo);
  });

  it('should update user name', async () => {
    mockRepo.findById.mockResolvedValue(
      new User('Old Name', 'john@test.com', undefined, '1'),
    );
    mockRepo.update.mockResolvedValue(
      new User('New Name', 'john@test.com', undefined, '1'),
    );

    const result = await useCase.execute('1', { name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(mockRepo.update).toHaveBeenCalledWith('1', { name: 'New Name' });
  });

  it('should hash password before updating', async () => {
    mockRepo.findById.mockResolvedValue(
      new User('John', 'john@test.com', undefined, '1'),
    );
    mockRepo.update.mockResolvedValue(
      new User('John', 'john@test.com', undefined, '1'),
    );

    await useCase.execute('1', { password: 'NewPass12' });

    const updateArg = mockRepo.update.mock.calls[0][1];
    expect(updateArg.password).not.toBe('NewPass12');
    const isHashed = await bcrypt.compare('NewPass12', updateArg.password!);
    expect(isHashed).toBe(true);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', { name: 'Test' })).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
