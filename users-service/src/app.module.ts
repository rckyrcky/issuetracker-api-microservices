import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './services/databases/database.module';
import { LoggingModule } from './services/logging/logging.module';
import { AuthModule } from './features/auth/auth.module';
import { JwtModule } from './services/jwt/jwt.module';
import { UsersModule } from './features/users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RmqActInterceptor } from './common/interceptors/rmqack.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule,
    DatabaseModule,
    LoggingModule,
    AuthModule,
    UsersModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: RmqActInterceptor }],
})
export class AppModule {}
