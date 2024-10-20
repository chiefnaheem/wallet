import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { ResponseDto } from '@gowagr/common/interface/response.interface';
import { UpdateUserDto } from '../dto/index.dto';
import { UserController } from '../controller/user.controller';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockResponse: ResponseDto = {
        statusCode: 200,
        message: 'successfully fetched profile',
        data: { id: 'user-id', firstName: 'John Doe' },
      };

      const userId = 'user-id';
      jest
        .spyOn(userService, 'findUserById')
        .mockResolvedValue(mockResponse.data);

      const result = await userController.getProfile(userId);

      expect(result).toEqual(mockResponse);
      expect(userService.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update user profile successfully', async () => {
      const mockResponse: ResponseDto = {
        statusCode: 200,
        message: 'successfully updated user',
        data: { id: 'user-id', name: 'John Doe Updated' },
      };

      const uid = 'user-id';
      const payload: UpdateUserDto = { firstName: 'John Doe Updated' };

      jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValue(mockResponse.data);

      const result = await userController.updateUser(uid, payload);

      expect(result).toEqual(mockResponse);
      expect(userService.updateUser).toHaveBeenCalledWith(uid, payload);
    });
  });

  describe('deleteUser', () => {
    it('should delete user profile successfully', async () => {
      const mockResponse: ResponseDto = {
        statusCode: 200,
        message: 'success',
        data: { message: 'User deleted successfully' },
      };

      const uid = 'user-id';
      jest
        .spyOn(userService, 'deleteUser')
        .mockResolvedValue(mockResponse.data);

      const result = await userController.deleteUser(uid);

      expect(result).toEqual(mockResponse);
      expect(userService.deleteUser).toHaveBeenCalledWith(uid);
    });
  });
});
