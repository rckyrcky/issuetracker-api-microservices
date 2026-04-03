import { Module } from '@nestjs/common';
import { HASH_SERVICE } from 'src/common/constants';
import { BcryptService } from 'src/services/hash/bcrypt.service';

@Module({
  providers: [
    {
      provide: HASH_SERVICE,
      useClass: BcryptService,
    },
  ],
  exports: [HASH_SERVICE],
})
export class HashModule {}
