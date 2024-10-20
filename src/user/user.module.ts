import { UserEntity } from '@gowagr/server/database/entities/user.entity';
import { TransactionModule } from '@gowagr/transactions/transactions.module';
import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => TransactionModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
