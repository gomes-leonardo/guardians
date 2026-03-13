import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new DeleteUserUseCase(mockRepo);
  });

  it('should soft delete an existing user', async () => {
    mockRepo.findById.mockResolvedValue(
      new User('John', 'john@test.com', undefined, '1'),
    );
    mockRepo.softDelete.mockResolvedValue();

    await expect(useCase.execute('1')).resolves.toBeUndefined();
    expect(mockRepo.softDelete).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
    expect(mockRepo.softDelete).not.toHaveBeenCalled();
  });
});
