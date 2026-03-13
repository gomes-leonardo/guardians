import {
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockHost: {
    switchToHttp: () => {
      getResponse: () => typeof mockResponse;
      getRequest: () => { url: string };
    };
  };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ url: '/test' }),
      }),
    };
  });

  function getResult(): {
    statusCode: number;
    message: string;
    path: string;
    timestamp: string;
  } {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return mockResponse.json.mock.calls[0][0] as {
      statusCode: number;
      message: string;
      path: string;
      timestamp: string;
    };
  }

  describe('HttpException handling', () => {
    it('should handle NotFoundException with correct status and message', () => {
      filter.catch(new NotFoundException('User not found'), mockHost as never);
      const result = getResult();

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('User not found');
    });

    it('should handle ConflictException', () => {
      filter.catch(
        new ConflictException('Email already exists'),
        mockHost as never,
      );
      const result = getResult();

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('Email already exists');
    });

    it('should handle BadRequestException with validation array', () => {
      filter.catch(
        new HttpException(
          { message: ['name must be a string', 'email must be valid'] },
          HttpStatus.BAD_REQUEST,
        ),
        mockHost as never,
      );
      const result = getResult();

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('name must be a string, email must be valid');
    });

    it('should handle HttpException with string response', () => {
      filter.catch(
        new HttpException('Forbidden', HttpStatus.FORBIDDEN),
        mockHost as never,
      );
      const result = getResult();

      expect(result.statusCode).toBe(403);
      expect(result.message).toBe('Forbidden');
    });
  });

  describe('Mongoose error handling', () => {
    it('should handle duplicate key error (E11000) as 409', () => {
      const mongoError = new Error('E11000 duplicate key error');
      mongoError.name = 'MongoServerError';
      (mongoError as Record<string, unknown>).code = 11000;
      (mongoError as Record<string, unknown>).keyPattern = { email: 1 };

      filter.catch(mongoError, mockHost as never);
      const result = getResult();

      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('A record with this email already exists');
    });

    it('should handle other Mongo errors as 500', () => {
      const mongoError = new Error('Connection timeout');
      mongoError.name = 'MongoServerError';
      (mongoError as Record<string, unknown>).code = 99999;

      filter.catch(mongoError, mockHost as never);
      const result = getResult();

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Database error');
    });
  });

  describe('CastError handling', () => {
    it('should handle invalid ObjectId as 400', () => {
      const castError = new Error(
        'Cast to ObjectId failed for value "abc" at path "_id"',
      );
      castError.name = 'CastError';
      (castError as Record<string, unknown>).path = '_id';

      filter.catch(castError, mockHost as never);
      const result = getResult();

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Invalid _id format');
    });
  });

  describe('generic Error handling', () => {
    it('should handle plain Error as 400 with its message', () => {
      filter.catch(new Error('Something went wrong'), mockHost as never);
      const result = getResult();

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Something went wrong');
    });
  });

  describe('unknown error handling', () => {
    it('should handle unknown exceptions as 500', () => {
      filter.catch('unexpected string error', mockHost as never);
      const result = getResult();

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal server error');
    });
  });

  it('should always include timestamp and path', () => {
    filter.catch(new BadRequestException('test'), mockHost as never);
    const result = getResult();

    expect(result.path).toBe('/test');
    expect(result.timestamp).toBeDefined();
  });
});
