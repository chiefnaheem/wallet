import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@gowagr/server/database/entities/user.entity';
import { TransactionService } from '@gowagr/transactions/service/transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordManager } from '@gowagr/common/functions/password-manager';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserService } from '../service/user.service';
describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
  let transactionService: TransactionService;

  const userData = {
    email: 'test@example.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
  };
  const mockUser = {
    ...userData,
    id: '1',
    username: 'JohnDoe',
    isEmailVerified: true,
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn().mockImplementation((cb) =>
        cb({
          create: jest.fn().mockReturnValue(mockUser),
          save: jest.fn().mockResolvedValue(mockUser),
        }),
      ),
    },
  };

  const mockTransactionService = {
    createWallet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    transactionService = module.get<TransactionService>(TransactionService);
  });

  describe('createUser', () => {
    it('should create a user and a wallet successfully', async () => {
      const userData = {
        email: 'test@example.com',
        // password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        ...userData,
        id: '1',
        username: 'JohnDoe',
        isEmailVerified: true,
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(PasswordManager, 'hash').mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(transactionService, 'createWallet').mockResolvedValue(null);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const userData = { email: 'test@example.com', password: 'password' };
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue({} as UserEntity);

      await expect(userService.createUser(userData)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const userData = { email: 'test@example.com', password: 'password' };
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest
        .spyOn(PasswordManager, 'hash')
        .mockRejectedValue(new Error('Hashing failed'));

      await expect(userService.createUser(userData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const mockUser = new UserEntity();
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.findUserByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null if user not found', async () => {
      const email = 'notfound@example.com';
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const result = await userService.findUserByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findUserByUsername', () => {
    it('should return a user if found', async () => {
      const username = 'johndoe';
      const mockUser = new UserEntity();
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.findUserByUsername(username);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });

    it('should return null if user not found', async () => {
      const username = 'notfound';
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const result = await userService.findUserByUsername(username);

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const id = '1';
      const mockUser = new UserEntity();
      jest
        .spyOn(mockUserRepository, 'findOneOrFail')
        .mockResolvedValue(mockUser);

      const result = await userService.findUserById(id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id },
        relations: ['wallet'],
      });
    });

    it('should throw error if user not found', async () => {
      const id = '1';
      jest
        .spyOn(mockUserRepository, 'findOneOrFail')
        .mockRejectedValue(new Error('User not found'));

      await expect(userService.findUserById(id)).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const id = '1';
      const mockUser = new UserEntity();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(mockUserRepository, 'delete').mockResolvedValue(null);

      const result = await userService.deleteUser(id);

      expect(result).toBeNull();
      expect(mockUserRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw error if user not found', async () => {
      const id = '1';
      jest
        .spyOn(userService, 'findUserById')
        .mockRejectedValue(new Error('User not found'));

      await expect(userService.deleteUser(id)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const id = '1';
      const userData = { firstName: 'Updated Name' };
      const mockUser = new UserEntity();
      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockUser);

      const result = await userService.updateUser(id, userData);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...userData, id });
    });

    it('should throw error if user not found', async () => {
      const id = '1';
      const userData = { firstName: 'Updated Name' };
      jest
        .spyOn(userService, 'findUserById')
        .mockRejectedValue(new Error('User not found'));

      await expect(userService.updateUser(id, userData)).rejects.toThrow();
    });
  });

  describe('sanitizeUser', () => {
    it('should return user data without password', async () => {
      const mockUser = { id: '1', username: 'johndoe', password: 'password' };
      const result = await userService.sanitizeUser(mockUser as UserEntity);

      expect(result).toEqual({ id: '1', username: 'johndoe' });
    });
  });
});
