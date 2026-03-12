import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { User } from '../../users/domain/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<Pick<AuthService, 'validateUser' | 'login'>>;

  beforeEach(() => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };
    controller = new AuthController(mockAuthService as unknown as AuthService);
  });

  describe('POST /auth/login', () => {
    const loginDto = { email: 'john@example.com', password: 'password1' };

    it('should return a token when credentials are valid', async () => {
      const user = new User('John', 'john@example.com', undefined, '1');
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockReturnValue({ token: 'jwt-token' });

      const result = await controller.login(loginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should propagate UnauthorizedException from service', async () => {
      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
