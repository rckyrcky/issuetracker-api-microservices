import { Global, Module } from '@nestjs/common';
import { JoseService } from './jose.service';
import { JWT_SERVICE } from 'src/common/constants';

@Global()
@Module({
  providers: [
    {
      provide: JWT_SERVICE,
      useClass: JoseService,
    },
  ],
  exports: [JWT_SERVICE],
})
export class JwtModule {}
