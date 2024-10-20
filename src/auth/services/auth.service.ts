import { PasswordManager } from '@gowagr/common/functions/password-manager';
import serverConfig from '@gowagr/server/config/env.config';
import { UserService } from '@gowagr/user/service/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/auth.dto';

import { JwtPayload, Tokens } from '../interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async loginAccount(payload: LoginDto) {
    try {
      const { email, password } = payload;
      const existingUser = await this.userService.findUserByEmail(email);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await PasswordManager.compare(
        existingUser.password,
        password,
      );

      if (!isMatch) {
        throw new BadRequestException('Invalid credentials.');
      } else {
        const { accessToken } = await this.getTokens({
          uid: existingUser.id,
          email: existingUser.email,
        });

        const isUnverified = existingUser.isEmailVerified === false;

        if (isUnverified) {
          throw new ForbiddenException(
            'Account is not verified. Verification email sent.',
          );
        }

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
}
