import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

interface CastError extends Error {
  kind?: string;
  path?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolveError(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private resolveError(exception: unknown): {
    status: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (this.isMongoError(exception)) {
      return this.handleMongoError(exception);
    }

    if (this.isCastError(exception)) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Invalid ${exception.path ?? 'parameter'} format`,
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private handleHttpException(exception: HttpException): {
    status: number;
    message: string;
  } {
    const status = exception.getStatus();
    const res = exception.getResponse();

    if (typeof res === 'string') {
      return { status, message: res };
    }

    const body = res as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return { status, message: body.message.join(', ') };
    }

    return { status, message: body.message ?? exception.message };
  }

  private handleMongoError(exception: MongoError): {
    status: number;
    message: string;
  } {
    if (exception.code === 11000 && exception.keyPattern) {
      const field = Object.keys(exception.keyPattern)[0];
      return {
        status: HttpStatus.CONFLICT,
        message: `A record with this ${field} already exists`,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error',
    };
  }

  private isMongoError(exception: unknown): exception is MongoError {
    return (
      exception instanceof Error &&
      (exception.name === 'MongoServerError' || exception.name === 'MongoError')
    );
  }

  private isCastError(exception: unknown): exception is CastError {
    return exception instanceof Error && exception.name === 'CastError';
  }
}
