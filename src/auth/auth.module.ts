import { AccountModule } from '@alpharide/account/account.module';
import { OtpEntity } from '@alpharide/server/database/entities/otp.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    AccountModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
