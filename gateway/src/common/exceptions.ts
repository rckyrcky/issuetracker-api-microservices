import { HttpException } from '@nestjs/common';

export class NotFoundError extends HttpException {
  constructor(message: string = "Sorry, we can't find that.") {
    super({ message }, 404);
  }
}

export class AuthenticationError extends HttpException {
  constructor(message: string = 'You must login first.') {
    super({ message }, 401);
  }
}

export class AuthorizationError extends HttpException {
  constructor(message: string = "Ooops, you don't have permission.") {
    super({ message }, 403);
  }
}

export class UserError extends HttpException {
  constructor(message: string = 'An error occured. Please retry.') {
    super({ message }, 400);
  }
}

export class RateLimitError extends HttpException {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super({ message }, 429);
  }
}

export class ServerError extends HttpException {
  constructor(message: string = 'Server is unavailable now.') {
    super({ message }, 500);
  }
}

export const postgreErrorCode = {
  check: '23514',
  foreignKey: '23503',
  unique: '23505',
};
