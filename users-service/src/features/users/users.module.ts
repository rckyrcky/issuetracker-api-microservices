import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY } from 'src/common/constants';
import { DrizzleUsersRepository } from './repository/drizzle.users.repository';
import { HashModule } from 'src/services/hash/hash.module';
import { RmqModule } from 'src/services/broker/rmq.module';

@Module({
  imports: [HashModule, RmqModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: DrizzleUsersRepository },
  ],
  exports: [UsersService, USERS_REPOSITORY],
})
export class UsersModule {}
