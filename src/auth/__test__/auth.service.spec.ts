import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@gowagr/user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/auth.dto';
import { PasswordManager } from '@gowagr/common/functions/password-manager';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

jest.mock('@gowagr/common/functions/password-manager');
jest.mock('@gowagr/user/service/user.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn(),
            sanitizeUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('loginAccount', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      userService.findUserByEmail = jest.fn().mockResolvedValue(null);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        isEmailVerified: true,
      };

      userService.findUserByEmail = jest.fn().mockResolvedValue(existingUser);
      PasswordManager.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if account is not verified', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        isEmailVerified: false,
      };

      userService.findUserByEmail = jest.fn().mockResolvedValue(existingUser);
      PasswordManager.compare = jest.fn().mockResolvedValue(true);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return access token and sanitized user on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        isEmailVerified: true,
      };
      const sanitizedUser = { id: '1', email: 'test@example.com' };
      const accessToken = 'someAccessToken';

      userService.findUserByEmail = jest.fn().mockResolvedValue(existingUser);
      PasswordManager.compare = jest.fn().mockResolvedValue(true);
      userService.sanitizeUser = jest.fn().mockResolvedValue(sanitizedUser);
      jwtService.signAsync = jest.fn().mockResolvedValue(accessToken);

      const result = await authService.loginAccount(loginDto);

      expect(result).toEqual({ accessToken, user: sanitizedUser });
      expect(userService.findUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(PasswordManager.compare).toHaveBeenCalledWith(
        existingUser.password,
        loginDto.password,
      );
      expect(userService.sanitizeUser).toHaveBeenCalledWith(existingUser);
    });
  });

  describe('getTokens', () => {
    it('should return access and refresh tokens', async () => {
      const jwtPayload = { uid: '1', email: 'test@example.com' };
      const accessToken = 'someAccessToken';
      const refreshToken = 'someRefreshToken';

      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const tokens = await authService.getTokens(jwtPayload);

      expect(tokens).toEqual({ accessToken, refreshToken });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        jwtPayload,
        expect.any(Object),
      );
    });
  });
});
