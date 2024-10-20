import { IdentificationManager } from '@gowagr/common/functions/identification-manager';
import {
  TransactionChannel,
  TransactionEntity,
  TransactionStatusEnum,
  transactionType,
} from '@gowagr/server/database/entities/transaction.entity';
import { WalletEntity } from '@gowagr/server/database/entities/wallet.entity';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
  ) {}

  async createWallet(
    user: any,
    entityManager?: EntityManager,
  ): Promise<WalletEntity> {
    try {
      const repository = entityManager
        ? entityManager.getRepository(WalletEntity)
        : this.walletRepository;

      const walletNumber = IdentificationManager.generateCodeNumeric(10);

      const payload = repository.create({
        user,
        balance: 0,
        ledgerBalance: 0,
        currency: 'NGN',
        walletNumber,
      });

      return await repository.save(payload);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Performs a transfer between two users' wallets.
   */
  async transferFunds(
    senderId: string,
    receiverId: string,
    amount: number,
  ): Promise<void> {
    if (senderId === receiverId) {
      throw new BadRequestException('Sender and receiver cannot be the same');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    await this.walletRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        try {
          const senderWallet = await entityManager
            .createQueryBuilder(WalletEntity, 'wallet')
            .where('wallet.userId = :senderId', { senderId })
            .setLock('pessimistic_write') // Row-level locking
            .getOne();

          if (!senderWallet) {
            throw new NotFoundException('Sender wallet not found');
          }

          const receiverWallet = await entityManager
            .createQueryBuilder(WalletEntity, 'wallet')
            .where('wallet.userId = :receiverId', { receiverId })
            .setLock('pessimistic_write') // Row-level locking
            .getOne();

          if (!receiverWallet) {
            throw new NotFoundException('Receiver wallet not found');
          }

          if (senderWallet.balance < amount) {
            throw new BadRequestException(
              'Insufficient balance in sender’s wallet',
            );
          }

          senderWallet.balance -= amount;
          await entityManager.save(senderWallet);

          receiverWallet.balance += amount;
          await entityManager.save(receiverWallet);

          const senderTransaction = entityManager.create(TransactionEntity, {
            user: senderWallet.user,
            amount,
            transactionType: transactionType.OUTFLOW,
            transactionChannel: TransactionChannel.IN_APP,
            description: `Transfer to user ID ${receiverId}`,
            currentBalance: senderWallet.balance.toString(),
            previousBalance: (senderWallet.balance + amount).toString(),
            reference: `TRX-${Date.now()}`,
            status: TransactionStatusEnum.SUCCESS,
          });
          await entityManager.save(senderTransaction);

          const receiverTransaction = entityManager.create(TransactionEntity, {
            user: receiverWallet.user,
            amount,
            transactionType: transactionType.INFLOW,
            transactionChannel: TransactionChannel.IN_APP,
            description: `Transfer from user ID ${senderId}`,
            currentBalance: receiverWallet.balance.toString(),
            previousBalance: (receiverWallet.balance - amount).toString(),
            reference: `TRX-${Date.now()}`,
            status: TransactionStatusEnum.SUCCESS,
          });
          await entityManager.save(receiverTransaction);

          this.logger.log(
            `Successfully transferred ${amount} from User ${senderId} to User ${receiverId}`,
          );
        } catch (error) {
          this.logger.error(
            `Transfer failed between User ${senderId} and User ${receiverId}: ${error.message}`,
          );
          throw error;
        }
      },
    );
  }

  /**
   * Fetches paginated transaction history for a user by ID.
   * Allows filtering by transactionType, transactionChannel, status, and date range.
   *
   * @param userId - The ID of the user whose transactions we want to fetch.
   * @param page - The page number (for pagination).
   * @param limit - Number of items per page (for pagination).
   * @param filters - Optional filters for the transactions (transactionType, transactionChannel, status, fromDate, toDate).
   * @returns Paginated and filtered transaction history.
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      transactionType?: transactionType;
      transactionChannel?: TransactionChannel;
      status?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<{
    data: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder =
      this.transactionRepository.createQueryBuilder('transaction');

    queryBuilder.where('transaction.userId = :userId', { userId });

    if (filters?.transactionType) {
      queryBuilder.andWhere('transaction.transactionType = :transactionType', {
        transactionType: filters.transactionType,
      });
    }

    if (filters?.transactionChannel) {
      queryBuilder.andWhere(
        'transaction.transactionChannel = :transactionChannel',
        {
          transactionChannel: filters.transactionChannel,
        },
      );
    }

    if (filters?.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fromDate) {
      queryBuilder.andWhere('transaction.createdAt >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters?.toDate) {
      queryBuilder.andWhere('transaction.createdAt <= :toDate', {
        toDate: filters.toDate,
      });
    }

    const total = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * limit).take(limit);

    const transactions = await queryBuilder.getMany();

    if (transactions.length === 0) {
      throw new NotFoundException(
        `No transactions found for user ID ${userId}`,
      );
    }

    return {
      data: transactions,
      total,
      page,
      limit,
    };
  }
}
