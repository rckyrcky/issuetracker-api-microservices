import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type ILoggingService from '../interfaces/logging.interface';
import { AuthRequest } from '../types/request.type';
import { generateErrorLogMessage } from '../utils';
import { LOGGING_SERVICE } from '../constants';

@Injectable()
export class LoggingInterceptors implements NestInterceptor {
  constructor(
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return next.handle().pipe(
      tap({
        next: () => {
          this.loggingService.info(
            'API Request success',
            this.generateRequestLogData(request),
          );
        },
        error: (error) => {
          this.loggingService.error(
            generateErrorLogMessage('API Request failed', error),
            {
              error,
              ...this.generateRequestLogData(request),
            },
          );
        },
      }),
    );
  }

  private generateRequestLogData(req: AuthRequest) {
    return {
      method: req.method,
      service: 'API',
      user_id: req.authData?.id,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    };
  }
}
