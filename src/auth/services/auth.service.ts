import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { addMinutes, isAfter } from 'date-fns';
  import { IdentificationManager } from 'src/common/functions/identification-manager';
  import { PasswordManager } from 'src/common/functions/password-manager';
  import { MailsService } from 'src/common/mail/mail.service';
  import serverConfig from 'src/database/config/env.config';
  import { UserService } from 'src/user/service/user.service';
  
  import {
    ChangePasswordDto,
    ForgotPasswordDto,
    LoginDto,
    ResetPasswordDto,
    VerifyEmailDto,
  } from '../dto/auth.dto';
  import {
    AppleLoginData,
    JwtPayload,
    SocialLoginData,
    Tokens,
  } from '../interfaces';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly userService: UserService,
      private jwtService: JwtService,
      private readonly mailService: MailsService,
    ) {}
  
    async loginAccount(payload: LoginDto) {
      try {
        const { email, password } = payload;
        const existingUser = await this.userService.findUserByEmail(email);
        if (!existingUser) {
          throw new NotFoundException('user not found');
        }
  
        const isMatch = await PasswordManager.compare(
          existingUser.password,
          password,
        );
  
        if (!isMatch) {
          throw new BadRequestException('Invalid credentials.');
        } else {
          const { accessToken } = await this.getTokens({
            id: existingUser.id,
            email: existingUser.email,
          });
  
          // const isUnverified = existingUser.isVerified === false;
  
          // if (isUnverified) {
          //   await this.resendVerificationEmail({ email: existingUser.email });
          //   throw new ForbiddenException(
          //     'Account is not verified. Verification email sent.',
          //   );
          // }
  
          const sanitizedUser = await this.userService.sanitizeUser(existingUser);
          return { accessToken, user: sanitizedUser };
        }
      } catch (error) {
        throw error;
      }
    }
  
    async getTokens(jwtPayload: JwtPayload): Promise<Tokens> {
      const [at, rt] = await Promise.all([
        this.jwtService.signAsync(jwtPayload, {
          secret: serverConfig.JWT_SECRET,
          expiresIn: '1d',
        }),
        this.jwtService.signAsync(jwtPayload, {
          secret: serverConfig.REFRESH_TOKEN_SECRET,
          expiresIn: '1d',
        }),
      ]);
  
      return {
        accessToken: at,
        refreshToken: rt,
      };
    }
  
    
    async changePassword(
      payload: ChangePasswordDto,
      userId: string,
    ): Promise<any> {
      try {
        const { newPassword, oldPassword } = payload;
  
        const existingUser = await this.userService.findUserById(userId);
  
        const isMatch = await PasswordManager.compare(
          existingUser.password,
          oldPassword,
        );
  
        if (!isMatch) {
          throw new NotFoundException('Invalid credentials.');
        }
  
        const hashedPassword = await PasswordManager.hash(newPassword);
  
        await this.userService.updateUser(existingUser.id, {
          password: hashedPassword,
        });
  
        return { message: 'Password changed successfully.' };
      } catch (error) {
        throw error;
      }
    }
  
   
  
   
  
   
  }
  