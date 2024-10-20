import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../service/transactions.service';
import { ResponseDto } from '@gowagr/common/interface/response.interface';
import { FilterTransactionsDto, TransferFundsDto } from '../dto/index.dto';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  TransactionChannel,
  TransactionStatusEnum,
  transactionType,
} from '@gowagr/server/database/entities/transaction.entity';
import { TransactionController } from '../controller/transactions.controller';

describe('UserController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  const mockTransactionService = {
    getTransactionHistory: jest.fn(),
    transferFunds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            {
              name: 'short',
              ttl: 10000,
              limit: 1,
            },
          ],
        }),
      ],
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    transactionService = module.get<TransactionService>(TransactionService);
  });

  describe('getHistory', () => {
    it('should return transaction history for the logged-in user', async () => {
      const mockResponse: ResponseDto = {
        statusCode: 200,
        message: 'successfully fetched transaction history',
        data: [],
      };

      const uid = 'user-id';
      const query: FilterTransactionsDto = {
        page: 1,
        limit: 10,
        transactionType: transactionType.INFLOW,
        transactionChannel: TransactionChannel.CARD,
        status: TransactionStatusEnum.FAILED,
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      jest
        .spyOn(transactionService, 'getTransactionHistory')
        .mockResolvedValue(mockResponse.data);

      const result = await transactionController.getHistory(uid, query);

      expect(result).toEqual(mockResponse);
      expect(transactionService.getTransactionHistory).toHaveBeenCalledWith(
        uid,
        query.page,
        query.limit,
        expect.objectContaining({
          transactionChannel: query.transactionChannel,
          transactionType: query.transactionType,
          status: query.status,
          fromDate: query.fromDate,
          toDate: query.toDate,
        }),
      );
    });
  });

  describe('transfer', () => {
    it('should transfer funds successfully', async () => {
      const uid = 'user-id';
      const payload: TransferFundsDto = {
        receiverId: 'receiver-id',
        amount: 100,
      };

      jest
        .spyOn(transactionService, 'transferFunds')
        .mockResolvedValue(undefined);

      const result = await transactionController.transfer(uid, payload);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Funds transferred successfully',
      });
      expect(transactionService.transferFunds).toHaveBeenCalledWith(
        uid,
        payload.receiverId,
        payload.amount,
      );
    });
  });
});
