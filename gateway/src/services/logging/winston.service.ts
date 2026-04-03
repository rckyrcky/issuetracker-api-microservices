import { Inject, Injectable } from '@nestjs/common';
import ILoggingService, {
  LogData,
} from 'src/common/interfaces/logging.interface';
import winston from 'winston';
import { WINSTON } from './winston.utils';

@Injectable()
export class WinstonService implements ILoggingService {
  constructor(@Inject(WINSTON) private readonly logger: winston.Logger) {}

  info(
    message: string,
    data?: Omit<LogData, 'error'> & Record<string, unknown>,
  ): void {
    try {
      this.logger.info(message, data);
    } catch (error) {
      console.error('[Logger Error] Failed to write info log:', error);
      console.error('[Original Log Attempt]', { message, data });
    }
  }

  warning(
    message: string,
    data?: Omit<LogData, 'error'> & Record<string, unknown>,
  ): void {
    try {
      this.logger.warning(message, data);
    } catch (error) {
      console.error('[Logger Error] Failed to write warning log:', error);
      console.error('[Original Log Attempt]', { message, data });
    }
  }

  error(message: string, data?: LogData & Record<string, unknown>): void {
    try {
      this.logger.error(message, data);
    } catch (error) {
      console.error('[Logger Error] Failed to write error log:', error);
      console.error('[Original Log Attempt]', { message, data });
    }
  }
}
