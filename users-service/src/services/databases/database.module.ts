import { Global, Module } from '@nestjs/common';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';

@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DatabaseModule {}
