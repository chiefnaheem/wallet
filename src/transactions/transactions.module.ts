import { TransactionEntity } from '@gowagr/server/database/entities/transaction.entity';
import { WalletEntity } from '@gowagr/server/database/entities/wallet.entity';
import { UserModule } from '@gowagr/user/user.module';
import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './controller/transactions.controller';
import { TransactionService } from './service/transactions.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, WalletEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
