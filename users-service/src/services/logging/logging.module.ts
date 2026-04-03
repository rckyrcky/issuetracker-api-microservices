import { Global, Module } from '@nestjs/common';
import { WinstonService } from './winston.service';
import { ConfigService } from '@nestjs/config';
import { WINSTON, winstonLogger } from './winston.utils';
import { APP_STATUS, LOGGING_SERVICE } from 'src/common/constants';

@Global()
@Module({
  providers: [
    {
      provide: WINSTON,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        winstonLogger(configService.get(APP_STATUS)!),
    },
    {
      provide: LOGGING_SERVICE,
      useClass: WinstonService,
    },
  ],
  exports: [LOGGING_SERVICE],
})
export class LoggingModule {}
