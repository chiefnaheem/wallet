import {
  AccountDto,
  ChangePasswordDto,
  CreateAccountDto,
  LoginAccountDto,
  LoginPhonenumber,
  LoginWithPhonenumber,
} from '@alpharide/account/dto/account.dto';
import { AccountService } from '@alpharide/account/service/account.service';
import { OnboardingService } from '@alpharide/account/service/onboarding.service';
import { EarningService } from '@alpharide/finance/earnings/earnings.service';
import { emailTemplates } from '@alpharide/mail/emailTemplates';
import { MailsService } from '@alpharide/mail/mail.service';
import serverConfig from '@alpharide/server/config/env.config';
import {
  AccountEntity,
  AccountStatusEnum,
  PlatformTypesEnum,
  SignupMediumEnum,
} from '@alpharide/server/database/entities/account.entity';
import { SmsService } from '@alpharide/sms/sms.service';
import { BaseMessageDto } from '@alpharide/utils/common/dtos/base-message.dto';
import { PasswordManager } from '@alpharide/utils/managers/password-manager';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  ForgotPasswordDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import { AuthEvents } from '../events/index.event';
import { JwtPayload, Tokens } from '../interfaces';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailsService,
    private readonly smsService: SmsService,
    private readonly onboardingService: OnboardingService,
    private readonly eventEmitter: EventEmitter2,
    private readonly earningService: EarningService,
  ) {}

  async getTokens(jwtPayload: JwtPayload): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: serverConfig.JWT_SECRET,
        expiresIn: serverConfig.JWT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: serverConfig.REFRESH_TOKEN_SECRET,
        expiresIn: serverConfig.REFRESH_TOKEN_EXPIRATION_TIME,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async createAccount(payload: CreateAccountDto): Promise<BaseMessageDto> {
    try {
      const {
        email,
        platform,
        name,
        nin,
        phoneNumber,
        onboardingStep,
        referralCode,
        vehicleType,
        signupMedium,
      } = payload;

      if (platform === PlatformTypesEnum.ADMIN) {
        throw new BadRequestException('You cannot register as an admin');
      }

      let existingUser: AccountEntity | null = null;

      if (signupMedium === SignupMediumEnum.WEB) {
        const loweredEmail = email.toLowerCase();
        existingUser = await this.accountService.findAccountByEmailOrPhone(
          loweredEmail,
        );
        const existingPhoneUser =
          await this.accountService.findAccountByEmailOrPhone(phoneNumber);
        if (existingUser || existingPhoneUser) {
          throw new Error('User already exists');
        }
      } else {
        existingUser = await this.accountService.findDuplicateAccountByEmail(
          email.toLowerCase(),
        );
        if (existingUser) {
          await this.accountService.updateAccount(existingUser.id, payload);
        }
      }

      if (!existingUser) {
        let referredBy: AccountEntity | null = null;

        if (referralCode) {
          referredBy =
            await this.accountService.findAccountByPhoneNumberOrReferralCodes(
              referralCode,
            );
        }
        if (!referralCode || !referredBy) {
          referredBy = await this.accountService.findLisBonDefaultAccount();
        }

        existingUser = await this.accountService.createAccount({
          ...payload,
          email: email ? email.toLowerCase() : null, // Convert to lower case letters
          platform,
          name,
          nin,
          phoneNumber,
          onboardingStep,
          referredBy,
        });

        if (vehicleType) {
          await this.onboardingService.createUserOnboarding(
            { vehicleType },
            existingUser.id,
          );
        }
      }

      const { accessToken, refreshToken } = await this.getTokens({
        uid: existingUser.id,
        email: existingUser?.email,
        name: existingUser?.name,
        phoneNumber: existingUser?.phoneNumber,
        platform: existingUser.platform,
      });

      const code = await this.otpService.generateOtp(email);

      // send email

      // TODO: SEND EMAIL VERIFICATION

      return {
        data: existingUser,
        accessToken,
        code,
        message: 'Account created successfully.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validatePassword(id: string, password: string): Promise<boolean> {
    try {
      const account = await this.accountService.findOneWithException(id);
      const isMatch = PasswordManager.compare(account.password, password);
      return !!isMatch;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAccountByPhoneNumberOrReferralCode(
    userId: string,
    search: string,
  ): Promise<AccountDto> {
    return await this.accountService.findAccountByPhoneNumberOrReferralCode(
      userId,
      search,
    );
  }

  async checkReferralCodeExists(search: string): Promise<AccountDto> {
    return await this.accountService.findAccountByPhoneNumberOrReferralCodes(
      search,
    );
  }

  async loginAccount(payload: LoginAccountDto): Promise<any> {
    try {
      const { email, password } = payload;
      const existingUser = await this.accountService.findAccountByEmail(email);

      if (!existingUser) {
        throw new Error('Email not found.');
      }

      const isMatch = PasswordManager.compare(existingUser.password, password);

      if (!isMatch) {
        throw new Error('Invalid credentials.');
      } else {
        const { accessToken, refreshToken } = await this.getTokens({
          uid: existingUser.id,
          email: existingUser?.email,
          name: existingUser?.name,
          phoneNumber: existingUser?.phoneNumber,
          platform: existingUser.platform,
        });
        await this.updateRefreshToken(existingUser?.id, refreshToken);

        // if (!existingUser.isEmailVerified) {
        //   await this.resendVerificationEmail({
        //     email: existingUser.email,
        //     platform: existingUser.platform,
        //   });
        //   throw new ForbiddenException(
        //     'Account is not verified. Verification email sent.',
        //   );
        // }
        const sanitizedUser = await this.accountService.sanitizeUser({
          ...existingUser,
        });
        return { account: sanitizedUser, accessToken, refreshToken };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async loginAccountWithOtp(payload: LoginWithPhonenumber): Promise<any> {
    try {
      const { phoneNumber, code, platform } = payload;
      let existingUser = await this.accountService.findAccountByPhone(
        phoneNumber,
      );

      const data = await this.otpService.verifyOtp({
        code,
        phoneNumberOrEmail: phoneNumber,
      });

      if (!existingUser && data) {
        existingUser = await this.accountService.createAccount({
          platform,
          phoneNumber,
        });
      }

      if (
        existingUser &&
        existingUser.accountStatus === AccountStatusEnum.SUSPENDED
      ) {
        throw new Error(
          'Your account has been suspended, kindly reach out to the admin',
        );
      }

      if (
        existingUser &&
        existingUser.accountStatus === AccountStatusEnum.BANNED
      ) {
        throw new Error(
          'Your account has been banned, kindly reach out to the admin',
        );
      }

      if (
        existingUser &&
        existingUser.accountStatus === AccountStatusEnum.INACTIVE
      ) {
        throw new Error(
          'Your account has been deactivated, kindly reach out to the admin',
        );
      }

      const { accessToken, refreshToken } = await this.getTokens({
        uid: existingUser.id,
        phoneNumber: existingUser.phoneNumber,
        name: existingUser?.name,
        platform: existingUser.platform,
      });
      await this.updateRefreshToken(existingUser?.id, refreshToken);

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...existingUser,
      });
      return { account: sanitizedUser, accessToken, refreshToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async loginAccountWithWeb(payload: LoginPhonenumber): Promise<any> {
    try {
      // const update = await this.accountService.setDefaultReferralForAccounts();

      // const earnings = await this.earningService.getEarnings();
      // // await this.earningService.updateEarnings(
      // //   '4057d956-7afb-4fb2-9d91-58805cd3678c',
      // // );
      // console.log(earnings, 'earnings');

      const { phoneNumber, code } = payload;
      const existingUser = await this.accountService.findAccountByPhone(
        phoneNumber,
      );

      const data = await this.otpService.verifyOtp({
        code,
        phoneNumberOrEmail: phoneNumber,
      });

      if (!existingUser && data) {
        throw new BadRequestException('Invalid credentials');
      }

      const { accessToken, refreshToken } = await this.getTokens({
        uid: existingUser.id,
        phoneNumber: existingUser.phoneNumber,
        name: existingUser?.name,
        platform: existingUser.platform,
      });
      await this.updateRefreshToken(existingUser?.id, refreshToken);

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...existingUser,
      });
      return { account: sanitizedUser, accessToken, refreshToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resendVerificationEmail(
    payload: ResendVerificationEmailDto,
  ): Promise<any> {
    try {
      const { email, platform } = payload;
      const existingUser =
        await this.accountService.findAccountByEmailAndPlatform(
          email,
          platform,
        );

      if (!existingUser) {
        throw new Error('Account not found.');
      }

      if (existingUser.isEmailVerified) {
        throw new BadRequestException('Email is verified already');
      }

      const code = await this.otpService.generateOtp(email);

      return {
        code,
        existingUser,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateRefreshToken(userId: string, rt: string): Promise<void> {
    try {
      await this.accountService.updateAccount(userId, {
        refreshToken: rt,
        lastLoggedIn: new Date(),
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    try {
      const user = await this.accountService.findUserByIdOrNull(userId);
      if (!user || !user.refreshToken) throw new Error('Access Denied');
      const data = this.jwtService.verify(rt, {
        secret: process.env.REFRESH_SECRET,
      });

      if (!data) throw new Error('Access Denied');

      const tokens = await this.getTokens({
        uid: user.id,
        email: user.email,
      });
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.accountService.findOneWithException(userId);
      await this.accountService.updateAccount(userId, { refreshToken: null });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendEmailOtp(
    email: string,
    platform: PlatformTypesEnum,
  ): Promise<AccountDto> {
    try {
      const accountExists =
        await this.accountService.findAccountByEmailAndPlatform(
          email,
          platform,
        );

      const code = await this.otpService.generateOtp(email);

      if (!accountExists) {
        await this.mailService.emailProcessor({
          to: email,
          subject: 'Email Verification',
          template: emailTemplates.emailVerification,
          data: { otp: code.toString() },
        });
        return null;
      }

      return accountExists;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyEmailAccount(payload: VerifyEmailDto): Promise<AccountDto> {
    try {
      const { email, code } = payload;

      const existingUser = await this.accountService.findAccountByEmail(email);

      if (!existingUser) {
        throw new Error('Account not found.');
      }

      const verifyOtp = await this.otpService.verifyOtp({
        phoneNumberOrEmail: email,
        code,
      });

      if (!verifyOtp) {
        throw new Error('Invalid verification code.');
      }

      const updates = await this.accountService.updateAccount(existingUser.id, {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        accountStatus: AccountStatusEnum.ACTIVE,
      });

      const { accessToken, refreshToken } = await this.getTokens({
        uid: existingUser.id,
        email: existingUser.email,
      });
      await this.updateRefreshToken(existingUser?.id, refreshToken);

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...updates,
      });

      return { ...(sanitizedUser as unknown as AccountDto), accessToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async sendPhoneNumberOtp(
  //   phoneNumber: string,
  //   platform: string,
  //   email?: string,
  // ): Promise<any> {
  //   const code = await this.otpService.generateOtp(phoneNumber);
  //   const account = await this.accountService.findAccountByPhoneNumber(
  //     phoneNumber,
  //     platform,
  //   );

  //   const message = `Your LisBon OTP is ${code}`;
  //   // const checkPhone = this.smsService.checkMobile(phoneNumber);
  //   await this.smsService.sendMessageOnbuka(message, phoneNumber);

  //   if ((account && account.email) || email) {
  //     this.eventEmitter.emit(AuthEvents.CREATE_ACCOUNT, {
  //       code,
  //       email: account.email || email,
  //       name: account.name || email,
  //       meta: 'phone-otp',
  //     });
  //   }

  //   return {
  //     code,
  //     account,
  //   };
  // }

  async sendPhoneNumberOtp(
    phoneNumber: string,
    platform: string,
    email?: string,
    isWeb?: boolean,
    isLogin?: boolean,
  ): Promise<{ code: string; account: AccountEntity | null }> {
    try {
      // Generate OTP
      const code = await this.otpService.generateOtp(phoneNumber);

      const account = await this.accountService.findAccountByPhone(phoneNumber);
      if (!isWeb && !isLogin && account) {
        return {
          account,
          code: null,
        };
      }

      if (!isWeb && isLogin && !account) {
        throw new NotFoundException('Account not found');
      }
      // console.log(account, 'account');
      if (isWeb && !account) throw new Error('User not found');

      const message = `Your LisBon OTP is ${code}`;
      //smsProcessor
      await this.smsService.smsProcessor(message, phoneNumber);

      const targetEmail = account?.email || email;
      const targetName = account?.name || email;

      if (targetEmail) {
        this.eventEmitter.emit(AuthEvents.CREATE_ACCOUNT, {
          code,
          email: targetEmail,
          name: targetName,
          meta: 'phone-otp',
        });
      }

      return {
        code,
        account,
      };
    } catch (error) {
      if (error?.status === 401 && error?.code === 20003) {
        throw new BadRequestException(
          'Sorry, we are unable to send message at the moment',
        );
      }
      // throw new BadRequestException(
      //   'Unable to send text message at the moment. Please try again later',
      // );
      throw error;
    }
  }

  async sendWhatsappPhoneNumberOtp(
    phoneNumber: string,
    platform: string,
  ): Promise<any> {
    const code = await this.otpService.generateOtp(phoneNumber);
    const account = await this.accountService.findAccountByPhoneNumber(
      phoneNumber,
      platform,
    );
    const message = `Your LisBon OTP is ${code}`;
    await this.smsService.sendTwilioWhatsAppMessage(code, phoneNumber);

    return {
      code,
      account,
    };
  }

  async verifyPhoneNumber(phoneNumber: string, code: string): Promise<boolean> {
    const data = await this.otpService.verifyOtp({
      code,
      phoneNumberOrEmail: phoneNumber,
    });
    return data;
  }

  async verifyEmailMobile(email: string, code: string): Promise<boolean> {
    const data = await this.otpService.verifyOtp({
      code,
      phoneNumberOrEmail: email,
    });
    return data;
  }

  async changePassword(
    payload: ChangePasswordDto,
    userId: string,
  ): Promise<BaseMessageDto> {
    try {
      const { password, oldPassword, confirmationPassword } = payload;

      if (password !== confirmationPassword) {
        throw new Error('Passwords do not match.');
      }

      const existingUser = await this.accountService.findOneWithException(
        userId,
      );

      const isMatch = await PasswordManager.compare(
        existingUser.password,
        oldPassword,
      );

      if (!isMatch) {
        throw new Error('Invalid credentials.');
      }

      const hashedPassword = await PasswordManager.hash(password);

      await this.accountService.updateAccount(existingUser.id, {
        password: hashedPassword,
      });

      return { message: 'Password changed successfully.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<BaseMessageDto> {
    try {
      const { email } = payload;

      const existingUser = await this.accountService.findAccountByEmail(email);

      if (!existingUser) {
        throw new Error('Account not found.');
      }

      const code = await this.otpService.generateOtp(email);

      // TODO: send email

      return {
        message: 'Password reset link sent successfully.',
        code,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async forgotAdminPassword(emailPassed: string): Promise<BaseMessageDto> {
    try {
      const admin = await this.accountService.findLisBonAdminAccount();

      const { email } = admin;
      if (email !== emailPassed.trim()) {
        throw new Error('Access Denied');
      }
      const existingUser = await this.accountService.findAccountByEmail(email);

      if (!existingUser) {
        throw new Error('Account not found.');
      }

      const code = await this.otpService.generateOtp(email, 10, 55);

      // TODO: send email

      return {
        message: 'Password reset link sent successfully.',
        code,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyOtp(email: string, code: string) {
    try {
      const verifyOtp = await this.otpService.verifyOtp({
        phoneNumberOrEmail: email,
        code,
      });

      if (!verifyOtp) {
        throw new Error('Verification code has expired.');
      }
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(payload: ResetPasswordDto): Promise<BaseMessageDto> {
    try {
      const { email, password } = payload;

      const existingUser = await this.accountService.findAccountByEmail(email);

      if (!existingUser) {
        throw new Error('Account not found.');
      }

      // const verifyOtp = await this.otpService.verifyOtp({
      //   phoneNumberOrEmail: email,
      //   code,
      // });

      // if (!verifyOtp) {
      //   throw new ConflictException('Verification code has expired.');
      // }

      const hashedPassword = PasswordManager.hash(password);

      await this.accountService.updateAccount(existingUser.id, {
        password: hashedPassword,
      });

      return { message: 'Password reset successfully.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Testing sms and email processors
  async testingProcessor(): Promise<any> {
    try {
      return await this.mailService.emailProcessor({
        to: 'obomheire@gmail.com',
        subject: 'Testing OTP',
        template: emailTemplates.emailOTP,
        data: { otp: '098765' },
      });

      // return await this.smsService.smsProcessor(
      //   'Demo SMS',
      //   '+2348030875579',
      //   'TWILIO',
      // );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
