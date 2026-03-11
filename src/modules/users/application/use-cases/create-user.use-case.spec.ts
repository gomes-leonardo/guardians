import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create a new user successfully', async () => {
    const userDto = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(
      new User(userDto.name, userDto.email, userDto.password, '1'),
    );

    const result = await useCase.execute(userDto);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userDto.email);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(result.id).toBeDefined();
    expect(result.email).toBe(userDto.email);
  });

  it('should throw an error if the user already exists', async () => {
    const userDto = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValue(
      new User(userDto.name, userDto.email, userDto.password, '1'),
    );

    await expect(useCase.execute(userDto)).rejects.toThrow(
      'User already exists',
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
