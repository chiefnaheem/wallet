import { BadRequestException, Injectable } from '@nestjs/common';
import { AppleLoginDto, SocialLoginDto } from '../dto/social-login.dto';
import { AccountService } from '@alpharide/account/service/account.service';
import { AuthService } from './auth.service';
import { AccountEntity } from '@alpharide/server/database/entities/account.entity';

@Injectable()
export class SocialLoginService {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

  async googleLogin(socialLoginDto: SocialLoginDto) {
    try {
      const { email } = socialLoginDto;

      let user = await this.accountService.findAccountByEmail(
        email.toLowerCase(),
      );

      if (!user) {
        user = await this.accountService.createAccount(
          {
            ...socialLoginDto,
            password: null,
          },
          true,
        );
      }

      return await this.loginUser(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async appleLogin(appleLoginDto: AppleLoginDto) {
    try {
      const { appleId, email, name } = appleLoginDto;

      // Check if an account with the provided appleId already exists
      let appleUserAccount = await this.accountService.findAccountByAppleId(
        appleId,
      );

      // If no account is found, try to find an account with the provided email
      if (!appleUserAccount && email) {
        appleUserAccount = await this.accountService.findAccountByEmail(
          email.toLowerCase(),
        );
      }

      // If no account is found, create a new account
      if (!appleUserAccount) {
        // Check if first name and last name are provided
        if (!name) {
          throw new BadRequestException(
            'First name and last name are required on first login',
          );
        }

        appleUserAccount = await this.accountService.createAccount(
          {
            ...appleLoginDto,
            email: email || `${appleId}@email.com`,
            password: null,
          },
          true,
        );
      } else {
        // If an account is found, update the appleId if it's not already set
        if (!appleUserAccount.appleId) {
          await this.accountService.updateAccount(
            '',
            { appleId },
            appleUserAccount,
          );
        }
      }

      // Login the user
      return await this.loginUser(appleUserAccount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async loginUser(user: AccountEntity) {
    try {
      const { accessToken, refreshToken } = await this.authService.getTokens({
        uid: user.id,
        email: user?.email,
        name: user?.name,
        phoneNumber: user?.accountNumber,
        platform: user.platform,
      });

      await this.authService.updateRefreshToken(user?.id, refreshToken);

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...user,
      });
      return { account: sanitizedUser, accessToken, refreshToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
