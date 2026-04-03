import { Global, Module } from '@nestjs/common';
import { UpstashService } from './upstash.service';
import { RATELIMIT_SERVICE } from 'src/common/constants';

@Global()
@Module({
  providers: [
    {
      provide: RATELIMIT_SERVICE,
      useClass: UpstashService,
    },
  ],
  exports: [RATELIMIT_SERVICE],
})
export class RateLimitModule {}
