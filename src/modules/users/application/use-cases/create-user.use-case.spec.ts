import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const validDto = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password1',
  };

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create a new user with hashed password', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockImplementation((user) => {
      return Promise.resolve(
        new User(user.name, user.email, user.password, '1'),
      );
    });

    const result = await useCase.execute(validDto);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
    expect(mockUserRepository.create).toHaveBeenCalled();

    const savedUser = mockUserRepository.create.mock.calls[0][0];
    expect(savedUser.password).not.toBe(validDto.password);
    const isHashed = await bcrypt.compare(
      validDto.password,
      savedUser.password!,
    );
    expect(isHashed).toBe(true);

    expect(result.id).toBe('1');
    expect(result.email).toBe(validDto.email);
  });

  it('should throw ConflictException if user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      new User(validDto.name, validDto.email, undefined, '1'),
    );

    await expect(useCase.execute(validDto)).rejects.toThrow(ConflictException);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should fail-fast if entity validation fails (weak password)', async () => {
    const weakDto = {
      name: 'User',
      email: 'user@mail.com',
      password: 'short',
    };

    await expect(useCase.execute(weakDto)).rejects.toThrow(
      'Password must be at least 8 characters',
    );
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should fail-fast if entity validation fails (invalid email)', async () => {
    const badEmailDto = {
      name: 'User',
      email: 'invalid',
      password: 'password1',
    };

    await expect(useCase.execute(badEmailDto)).rejects.toThrow(
      'Invalid email format',
    );
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });
});
