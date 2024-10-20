import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/auth.dto';
import { CreateUserDto } from '@gowagr/user/dto/index.dto';
import { AuthController } from '../controller/auth.controller';
import { SignupMediumEnum } from '@gowagr/server/database/entities/user.entity';
import { ResponseDto } from '@gowagr/common/interface/response.interface';
import { UserService } from '@gowagr/user/service/user.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockAuthService = {
    loginAccount: jest.fn(),
  };

  const mockUserService = {
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('loginAccount', () => {
    it('should return a successful login response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockAccount = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockAuthService.loginAccount.mockResolvedValue(mockAccount);

      const result: ResponseDto = await authController.loginAccount(loginDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'success',
        data: mockAccount,
      });
      expect(mockAuthService.loginAccount).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('createAccount', () => {
    it('should return a successful registration response', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        signupMedium: SignupMediumEnum.MOBILE,
        dob: '1999',
        phoneNumber: '7777',
      };
      const mockUser = { id: '1', ...createUserDto };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result: ResponseDto = await authController.createAccount(
        createUserDto,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'success',
        data: mockUser,
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
