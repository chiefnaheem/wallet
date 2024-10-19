import { IdentificationManager } from '@gowagr/common/functions/identification-manager';
import { TransactionEntity } from '@gowagr/server/database/entities/transaction.entity';
import { WalletEntity } from '@gowagr/server/database/entities/wallet.entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
}
