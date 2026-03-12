import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MongooseUserRepository } from '../../users/infrastructure/database/mongoose/user.repository';
import { User } from '../../users/domain/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<
    Pick<MongooseUserRepository, 'findByEmail' | 'findById' | 'create'>
  >;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const hashedPassword = bcrypt.hashSync('password1', 10);

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };
    authService = new AuthService(
      mockUserRepository as unknown as MongooseUserRepository,
      mockJwtService as unknown as JwtService,
    );
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new User('John', 'john@example.com', hashedPassword, '1'),
      );

      const result = await authService.validateUser(
        'john@example.com',
        'password1',
      );

      expect(result.email).toBe('john@example.com');
      expect(result.id).toBe('1');
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser('unknown@example.com', 'password1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new User('John', 'john@example.com', hashedPassword, '1'),
      );

      await expect(
        authService.validateUser('john@example.com', 'wrongpass1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a signed JWT token', () => {
      const user = new User('John', 'john@example.com', undefined, '1');

      const result = authService.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'john@example.com',
      });
      expect(result).toEqual({ token: 'signed-jwt-token' });
    });
  });
});
