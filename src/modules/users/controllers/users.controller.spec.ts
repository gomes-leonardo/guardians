import { ConflictException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { User } from '../domain/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let mockCreateUserUseCase: jest.Mocked<Pick<CreateUserUseCase, 'execute'>>;

  beforeEach(() => {
    mockCreateUserUseCase = {
      execute: jest.fn(),
    };
    controller = new UsersController(
      mockCreateUserUseCase as unknown as CreateUserUseCase,
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
      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(result.email).toBe('john@example.com');
      expect(result.id).toBe('1');
      expect(result.password).toBeUndefined();
    });

    it('should propagate ConflictException when email already exists', async () => {
      mockCreateUserUseCase.execute.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate domain error when password is weak', async () => {
      mockCreateUserUseCase.execute.mockRejectedValue(
        new Error(
          'Password must be at least 8 characters with at least 1 letter and 1 number',
        ),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });
  });
});
