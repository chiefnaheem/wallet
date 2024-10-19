import { User } from '@gowagr/server/database/entities/account.entity';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailsModule } from 'src/common/mail/mail.module';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), MailsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
