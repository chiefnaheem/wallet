import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '@alpharide/server/database/base.entity';
import { PaymentMethodEntity } from '@alpharide/server/database/entities/paymentMethod.entity';
import { AccountEntity } from './account.entity';
import { WithdrawalEntity } from './withdrawal.entity';

@Entity({ name: 'wallets' })
export class WalletEntity extends BaseEntity {
  @Column()
  balance: string;

  @Column()
  ledgerBalance: string;

  @Column()
  currency: string;

  @Column({ nullable: true })
  totalEarning: string;

  @Column({ nullable: true })
  totalExpense: string;

  @Column({ nullable: true })
  lisbonEarning: string;

  @Column({ nullable: true })
  lisbonWallet: string;

  @Column({ nullable: true })
  netProfit: string;

  @OneToOne(() => AccountEntity, (user) => user.wallet, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: AccountEntity;

  @OneToMany(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.wallet)
  paymentMethods: PaymentMethodEntity[];

  @OneToMany(() => WithdrawalEntity, (withdrawal) => withdrawal.wallet)
  withdrawal: WithdrawalEntity[];
}
