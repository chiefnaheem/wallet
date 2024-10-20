import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards/at.guard';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from 'typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './transactions/transactions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    JwtModule.register({ global: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 10000,
          limit: 1,
        },
        {
          name: 'medium',
          ttl: 20000,
          limit: 2,
        },
        {
          name: 'long',
          ttl: 35000,
          limit: 50,
        },
      ],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 5000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 20000,
          limit: 25,
        },
        {
          name: 'long',
          ttl: 35000,
          limit: 50,
        },
      ],
    }),

    UserModule,
    AuthModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_GUARD,
      useValue: AtGuard,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
