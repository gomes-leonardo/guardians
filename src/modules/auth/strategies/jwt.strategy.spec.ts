import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(mockConfigService);
  });

  describe('validate', () => {
    it('should return user object with id and email from payload', () => {
      const payload = { sub: '123', email: 'john@example.com' };

      const result = strategy.validate(payload);

      expect(result).toEqual({ id: '123', email: 'john@example.com' });
    });

    it('should map sub claim to id field', () => {
      const payload = { sub: 'abc-def', email: 'test@test.com' };

      const result = strategy.validate(payload);

      expect(result.id).toBe('abc-def');
    });
  });
});
