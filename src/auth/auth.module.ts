import { AccountModule } from '@alpharide/account/account.module';
import { MailsModule } from '@alpharide/mail/mail.module';
import { OtpEntity } from '@alpharide/server/database/entities/otp.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { AuthListener } from './listener/auth.listener';
import { AuthService } from './service/auth.service';
import { OtpService } from './service/otp.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { SocialLoginController } from './controller/auth.social-login.controller';
import { SocialLoginService } from './service/social-login.service';
import { SmsModule } from '@alpharide/sms/sms.module';
import { EarningModule } from '@alpharide/finance/earnings/earnings.module';
import { AuthOperatorController } from './controller/auth.operator.controller';
import { AuthOperatorService } from './service/auth.operator.service';
import { CompanyEntity } from '@alpharide/server/database/entities/company.entity';
import { StaffModule } from '@alpharide/staff/staff.module';
import { CryptoService } from './service/crypto.service';

@Module({
  imports: [
    AccountModule,
    MailsModule,
    SmsModule,
    TypeOrmModule.forFeature([OtpEntity, CompanyEntity]),
    EarningModule,
    StaffModule,
  ],
  controllers: [AuthController, SocialLoginController, AuthOperatorController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    OtpService,
    AuthListener,
    SocialLoginService,
    AuthOperatorService,
    CryptoService,
  ],
  exports: [AuthService, OtpService, CryptoService],
})
export class AuthModule {}
