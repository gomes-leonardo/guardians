import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { User } from '../domain/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let mockCreateUseCase: jest.Mocked<Pick<CreateUserUseCase, 'execute'>>;
  let mockUpdateUseCase: jest.Mocked<Pick<UpdateUserUseCase, 'execute'>>;
  let mockDeleteUseCase: jest.Mocked<Pick<DeleteUserUseCase, 'execute'>>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn() };
    mockUpdateUseCase = { execute: jest.fn() };
    mockDeleteUseCase = { execute: jest.fn() };
    controller = new UsersController(
      mockCreateUseCase as unknown as CreateUserUseCase,
      mockUpdateUseCase as unknown as UpdateUserUseCase,
      mockDeleteUseCase as unknown as DeleteUserUseCase,
    );
  });

  describe('POST /users', () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Secret12',
    };

    it('should create and return a new user', async () => {
      const createdUser = new User(
        'John Doe',
        'john@example.com',
        undefined,
        '1',
      );
      mockCreateUseCase.execute.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(result.email).toBe('john@example.com');
      expect(result.id).toBe('1');
      expect(result.password).toBeUndefined();
    });

    it('should propagate ConflictException when email already exists', async () => {
      mockCreateUseCase.execute.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('PUT /users/:id', () => {
    it('should update and return user', async () => {
      mockUpdateUseCase.execute.mockResolvedValue(
        new User('New Name', 'john@example.com', undefined, '1'),
      );

      const result = await controller.update('1', { name: 'New Name' });

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith('1', {
        name: 'New Name',
      });
      expect(result.name).toBe('New Name');
    });

    it('should propagate NotFoundException', async () => {
      mockUpdateUseCase.execute.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.update('999', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete a user', async () => {
      mockDeleteUseCase.execute.mockResolvedValue();

      await expect(controller.delete('1')).resolves.toBeUndefined();
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should propagate NotFoundException', async () => {
      mockDeleteUseCase.execute.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
