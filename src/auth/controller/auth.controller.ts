import {
  AccountDto,
  CreateAccountDto,
  LoginAccountDto,
  LoginPhonenumber,
  LoginWithPhonenumber,
} from '@alpharide/account/dto/account.dto';
import { AccountService } from '@alpharide/account/service/account.service';
import serverConfig from '@alpharide/server/config/env.config';
import { SignupMediumEnum } from '@alpharide/server/database/entities/account.entity';
import { GetCurrentUser } from '@alpharide/utils/common/decorators/get-current-user.decorator';
import { Public } from '@alpharide/utils/common/decorators/public.decorator';
import { ApiServiceResponse } from '@alpharide/utils/common/decorators/service-response.dto';
import { BaseMessageDto } from '@alpharide/utils/common/dtos/base-message.dto';
import { IServiceResponse } from '@alpharide/utils/helpers/response-handler';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  SearchReferralDto,
  SendPhoneNumberDto,
  VerifyEmailDto,
  VerifyPhoneNumberDto,
} from '../dto/auth.dto';
import { AuthEvents } from '../events/index.event';
import { RtGuard } from '../guards/rt.guard';
import { Tokens } from '../interfaces';
import { AuthService } from '../service/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
    private readonly accountservice: AccountService,
  ) {}

  @Public()
  @Post('login-admin')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'Admin log in' })
  async loginAccount(
    @Body() body: LoginAccountDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const account = await this.authService.loginAccount(body);

    return {
      status: 200,
      message: 'success',
      data: account,
    };
  }

  @Public()
  @Post('login-phone-number')
  @ApiOperation({
    summary: 'Log in with phone number for customer and driver platforms',
  })
  @ApiServiceResponse(AccountDto)
  async loginAccountWithOtp(
    @Body() body: LoginWithPhonenumber,
  ): Promise<IServiceResponse<AccountDto>> {
    const account = await this.authService.loginAccountWithOtp(body);
    this.eventEmitter.emit(AuthEvents.LOGIN, {
      name: account.name,
      // meta: 'phone-otp',
    });
    return {
      status: 200,
      message: 'success',
      data: account,
    };
  }

  @Public()
  @Post('login-web')
  @ApiOperation({
    summary: 'Log in on the website',
  })
  @ApiServiceResponse(AccountDto)
  async loginAccountWithWeb(
    @Body() body: LoginPhonenumber,
  ): Promise<IServiceResponse<AccountDto>> {
    const account = await this.authService.loginAccountWithWeb(body);
    this.eventEmitter.emit(AuthEvents.LOGIN_ACCOUNT, {
      name: account.name,
      // meta: 'phone-otp',
    });
    return {
      status: 200,
      message: 'success',
      data: account,
    };
  }

  @Public()
  @Post('register')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'User account registration' })
  async createAccount(
    @Body() body: CreateAccountDto,
  ): Promise<IServiceResponse<BaseMessageDto>> {
    const res = await this.authService.createAccount(body);
    if (body.signupMedium && body?.signupMedium === SignupMediumEnum.WEB) {
      const { code, data } = res;
      if (data) {
        this.eventEmitter.emit(AuthEvents.CREATE_ACCOUNT, {
          code,
          email: data.email,
          name: data.name,
          meta: 'welcome',
          platform: data.platform,
        });
      }
    }
    return {
      status: 200,
      message: 'success',
      data: res,
    };
  }

  // @Public()
  @ApiBearerAuth('access-token')
  @Post('referral')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'update the referral of reffered users' })
  async updateReferral(
    @GetCurrentUser('uid') uid: string,
    @Body() body: SearchReferralDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const res = await this.authService.findAccountByPhoneNumberOrReferralCode(
      uid,
      body.searchCode,
    );
    // const { code, data } = res;
    // this.eventEmitter.emit(AuthEvents.CREATE_ACCOUNT, {
    //   code,
    //   email: data.email,
    //   name: data.name,
    // });
    return {
      status: 200,
      message: 'success',
      data: res,
    };
  }

  @Public()
  @ApiBearerAuth('access-token')
  @Post('check-referral-code')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'update the referral of reffered users' })
  async checkReferral(
    @Body() body: SearchReferralDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const res = await this.authService.checkReferralCodeExists(body.searchCode);

    return {
      status: 200,
      message: 'success',
      data: res,
    };
  }

  @Public()
  @UseGuards(RtGuard)
  @Get('refresh-token')
  @ApiBearerAuth('refresh-token')
  @ApiServiceResponse(Tokens)
  async refreshTokens(
    @GetCurrentUser('uid') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<IServiceResponse<Tokens>> {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    return {
      status: 200,
      message: 'success',
      data: tokens,
    };
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with the otp sent to email' })
  @ApiServiceResponse(AccountDto)
  async verifyEmail(
    @Body() body: VerifyEmailDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const account = await this.authService.verifyEmailAccount(body);
    return {
      data: account,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('send-email-otp')
  @ApiOperation({ summary: 'send otp to email' })
  @ApiServiceResponse(AccountDto)
  async sendEmailOtp(
    @Body() body: ResendVerificationEmailDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const data = await this.authService.sendEmailOtp(body.email, body.platform);
    return {
      message: 'success',
      status: 200,
      data,
    };
  }

  @Public()
  @Post('verify-phone-number')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'verify phone number' })
  async verifyPhoneNumber(
    @Body() body: VerifyPhoneNumberDto,
  ): Promise<IServiceResponse<boolean>> {
    const account = await this.authService.verifyPhoneNumber(
      body.phoneNumber,
      body.code,
    );
    return {
      data: account,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('verify-email-mobile')
  @ApiOperation({ summary: 'verify email on mobile app' })
  async verifyEmailMobile(
    @Body() body: VerifyEmailDto,
  ): Promise<IServiceResponse<boolean>> {
    const account = await this.authService.verifyEmailMobile(
      body.email,
      body.code,
    );
    return {
      data: account,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('send-phone-otp')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'send otp to phone number' })
  async sendPhoneNumberOtp(
    @Body() body: SendPhoneNumberDto,
  ): Promise<IServiceResponse<any>> {
    const account = await this.authService.sendPhoneNumberOtp(
      body.phoneNumber,
      body.platform,
      body.email,
      body.isWeb,
      body.isLogin,
    );

    return {
      data: account,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('send-register-phone-otp')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'send otp to phone number on first registration' })
  async sendRegisterPhoneNumberOtp(
    @Body() body: SendPhoneNumberDto,
  ): Promise<IServiceResponse<any>> {
    let userEmail;
    if (body.email) {
      userEmail = await this.accountservice.findAccountByEmailOrPhone(
        body.email.toLowerCase(),
      );
    }
    const userPhone = await this.accountservice.findAccountByEmailOrPhone(
      body.phoneNumber,
    );
    if (userEmail || userPhone) {
      throw new ConflictException('User already exists');
    }
    const account = await this.authService.sendPhoneNumberOtp(
      body.phoneNumber,
      body.platform,
      body.email,
    );

    return {
      data: account,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('send-whatsapp-otp')
  @ApiServiceResponse(AccountDto)
  @ApiOperation({ summary: 'send otp to whatsapp contact' })
  async sendWhatsappPhoneNumberOtp(
    @Body() body: SendPhoneNumberDto,
  ): Promise<IServiceResponse<string>> {
    const account = await this.authService.sendWhatsappPhoneNumberOtp(
      body.phoneNumber,
      body.platform,
    );
    return {
      data: account,
      message: 'success',
      status: 200,
    };
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @GetCurrentUser('uid') userId: string,
  ): Promise<IServiceResponse<void>> {
    await this.authService.logout(userId);
    return {
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('resend-verification-email')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'resend email verification' })
  async resendVerificationEmail(
    @Body() body: ResendVerificationEmailDto,
  ): Promise<IServiceResponse<BaseMessageDto>> {
    const res = await this.authService.resendVerificationEmail(body);
    const { code, existingUser: data } = res;
    this.eventEmitter.emit(AuthEvents.CREATE_ACCOUNT, {
      code,
      email: data.email,
      name: data.name,
    });
    return {
      data: res,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('forgot-password')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Admit forgot password send email' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const { code } = await this.authService.forgotAdminPassword(body.email);
    const link = `${serverConfig.FRONTEND_URL}/reset-password?email=${body.email}&code=${code}`;
    this.eventEmitter.emit(AuthEvents.FORGOT_PASSWORD, {
      link,
      email: body.email,
      name: 'LisBon Admin',
    });
    return {
      message: 'Password reset link sent successfully.',
      status: 200,
      data: link,
    };
  }

  @Public()
  @Post('reset-password')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Admit reset password' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body);

    return {
      message: 'Password reset successfully.',
      status: 200,
    };
  }

  @Public()
  @Post('verify-forgot-password-otp')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Admit reset password' })
  async verifyOTP(@Body() body: VerifyEmailDto) {
    const data = await this.authService.verifyOtp(body.email, body.code);

    return {
      message: 'Otp verified successfully',
      status: 200,
      data,
    };
  }

  // Testing sms and email processors
  @Public()
  @Get('testing-providers')
  async testingProcessor() {
    return await this.authService.testingProcessor();
  }
}
