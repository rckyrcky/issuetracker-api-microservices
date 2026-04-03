import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { generateErrorLogMessage } from 'src/common/utils';
import {
  IRateLimitService,
  RateLimitKey,
} from 'src/common/interfaces/rate-limit.interface';
import { LOGGING_SERVICE } from 'src/common/constants';

@Injectable()
export class UpstashService implements OnModuleInit, IRateLimitService {
  constructor(
    @Inject(LOGGING_SERVICE) private readonly loggingService: ILoggingService,
  ) {}
  private redis: Redis;
  private prefix: string;
  private rateLimit: Record<RateLimitKey, Ratelimit>;
  private service = this.constructor.name;

  onModuleInit() {
    this.prefix = 'rl-itnest';
    this.redis = Redis.fromEnv();
    this.rateLimit = {
      login: new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(5, '5 m'),
        prefix: `${this.prefix}-login`,
        analytics: true,
      }),
      signup: new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(3, '10 m'),
        prefix: `${this.prefix}-signup`,
        analytics: true,
      }),
      mutation: new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: `${this.prefix}-mutation`,
        analytics: true,
      }),
    };
  }

  async checkRateLimit(key: RateLimitKey, identifier: string) {
    try {
      const result = await this.rateLimit[key].limit(identifier);
      return result.success;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Rate limit service failed', error),
        { error, method: this.checkRateLimit.name, service: this.service },
      );
      return true;
    }
  }
}
