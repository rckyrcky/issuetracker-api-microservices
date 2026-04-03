import { RpcException } from '@nestjs/microservices';

export class NotFoundError extends RpcException {
  constructor(message: string = "Sorry, we can't find that.") {
    super({ message, statusCode: 404 });
  }
}

export class AuthenticationError extends RpcException {
  constructor(message: string = 'You must login first.') {
    super({ message, statusCode: 401 });
  }
}

export class AuthorizationError extends RpcException {
  constructor(message: string = "Ooops, you don't have permission.") {
    super({ message, statusCode: 403 });
  }
}

export class UserError extends RpcException {
  constructor(message: string = 'An error occured. Please retry.') {
    super({ message, statusCode: 400 });
  }
}

export class RateLimitError extends RpcException {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super({ message, statusCode: 429 });
  }
}

export class ServerError extends RpcException {
  constructor(message: string = 'Server is unavailable now.') {
    super({ message, statusCode: 500 });
  }
}

export const postgreErrorCode = {
  check: '23514',
  foreignKey: '23503',
  unique: '23505',
};
