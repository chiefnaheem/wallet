import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletEntity } from '@gowagr/server/database/entities/wallet.entity';
import { TransactionEntity } from '@gowagr/server/database/entities/transaction.entity';
import { Repository, EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { TransactionService } from '../service/transactions.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let walletRepository: Repository<WalletEntity>;
  let transactionRepository: Repository<TransactionEntity>;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const mockWalletRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      manager: {
        transaction: jest.fn((cb) => cb(mockEntityManager)),
      },
    };

    const mockTransactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getCount: jest.fn(),
        getOne: jest.fn(),
        setLock: jest.fn().mockReturnThis(),
      }),
    };

    const mockEntityManager = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
      create: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
      save: jest.fn(async (entity) => {
        if (entity instanceof WalletEntity) {
          return { ...entity };
        }
        return entity;
      }),
      getRepository: jest.fn((entity) => {
        if (entity === WalletEntity) {
          return mockWalletRepository;
        }
        if (entity === TransactionEntity) {
          return mockTransactionRepository;
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(WalletEntity),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: mockTransactionRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        Logger,
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    walletRepository = module.get<Repository<WalletEntity>>(
      getRepositoryToken(WalletEntity),
    );
    transactionRepository = module.get<Repository<TransactionEntity>>(
      getRepositoryToken(TransactionEntity),
    );
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('createWallet', () => {
    it('should create and return a new wallet', async () => {
      const user = { id: '123' };
      const mockWallet = { user, walletNumber: '1234567890', balance: 0 };

      jest.spyOn(walletRepository, 'create').mockReturnValue(mockWallet as any);
      jest.spyOn(walletRepository, 'save').mockResolvedValue(mockWallet as any);

      const result = await service.createWallet(user, entityManager);

      expect(walletRepository.create).toHaveBeenCalledWith({
        user,
        balance: 0,
        ledgerBalance: 0,
        currency: 'NGN',
        walletNumber: expect.any(String),
      });
      expect(walletRepository.save).toHaveBeenCalledWith(mockWallet);
      expect(result).toEqual(mockWallet);
    });

    it('should throw BadRequestException on failure', async () => {
      const user = { id: '123' };

      jest
        .spyOn(walletRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.createWallet(user, entityManager)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('transferFunds', () => {
    it('should perform a successful transfer between wallets', async () => {
      const senderId = '123';
      const receiverId = '456';
      const amount = 100;

      const senderWallet: any = new WalletEntity();
      senderWallet.user = { id: senderId };
      senderWallet.balance = 200;

      const receiverWallet: any = new WalletEntity();
      receiverWallet.user = { id: receiverId };
      receiverWallet.balance = 50;

      jest.spyOn(entityManager, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            where: jest.fn().mockReturnThis(),
            setLock: jest.fn().mockReturnThis(),
            getOne: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve(senderWallet))
              .mockImplementationOnce(() => Promise.resolve(receiverWallet)),
          } as any),
      );

      jest.spyOn(entityManager, 'save').mockImplementation(async (entity) => {
        if (entity instanceof WalletEntity) {
          if (entity.user.id === senderId) {
            console.log(
              `Before Updating sender wallet balance: ${senderWallet.balance}`,
            );
            senderWallet.balance -= amount;
            console.log(
              `After Updating sender wallet balance: ${senderWallet.balance}`,
            );
            return senderWallet;
          } else if (entity.user.id === receiverId) {
            // Add the amount to receiver's wallet
            console.log(
              `Before Updating receiver wallet balance: ${receiverWallet.balance}`,
            );
            receiverWallet.balance += amount;
            console.log(
              `After Updating receiver wallet balance: ${receiverWallet.balance}`,
            );
            return receiverWallet; // Return the updated receiver wallet
          }
        }
        return entity;
      });

      await service.transferFunds(senderId, receiverId, amount);

      console.log(`Final sender wallet balance: ${senderWallet.balance}`);
      console.log(`Final receiver wallet balance: ${receiverWallet.balance}`);

      expect(senderWallet.balance).toBe(0);
      expect(receiverWallet.balance).toBe(50);
      expect(entityManager.save).toHaveBeenCalledTimes(4);
    });

    it('should throw BadRequestException when sender and receiver are the same', async () => {
      const senderId = '123';
      const receiverId = '123';
      const amount = 100;

      await expect(
        service.transferFunds(senderId, receiverId, amount),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is zero or less', async () => {
      const senderId = '123';
      const receiverId = '456';

      await expect(
        service.transferFunds(senderId, receiverId, 0),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.transferFunds(senderId, receiverId, -50),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if sender wallet is not found', async () => {
      const senderId = '123';
      const receiverId = '456';
      const amount = 100;

      jest.spyOn(entityManager, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            where: jest.fn().mockReturnThis(),
            setLock: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(null),
          } as any),
      );

      await expect(
        service.transferFunds(senderId, receiverId, amount),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if sender has insufficient balance', async () => {
      const senderId = '123';
      const receiverId = '456';
      const amount = 300;
      const senderWallet = { userId: senderId, balance: 200 };

      jest.spyOn(entityManager, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            where: jest.fn().mockReturnThis(),
            setLock: jest.fn().mockReturnThis(),
            getOne: jest
              .fn()
              .mockResolvedValueOnce(senderWallet)
              .mockResolvedValueOnce({ userId: receiverId, balance: 50 }),
          } as any),
      );

      await expect(
        service.transferFunds(senderId, receiverId, amount),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const userId = '123';
      const transactions = [{ id: 1 }, { id: 2 }];
      const total = 2;

      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(transactions),
        getCount: jest.fn().mockResolvedValue(total),
      } as any);

      const result = await service.getTransactionHistory(userId, 1, 10, {});

      expect(result.data).toEqual(transactions);
      expect(result.total).toEqual(total);
      expect(result.page).toEqual(1);
      expect(result.limit).toEqual(10);
    });

    it('should throw NotFoundException if no transactions found', async () => {
      const userId = '123';

      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      } as any);

      await expect(
        service.getTransactionHistory(userId, 1, 10, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
