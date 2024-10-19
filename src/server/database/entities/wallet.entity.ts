import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'wallets' })
export class WalletEntity extends BaseEntity {
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
  balance: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  ledgerBalance: number;

  @Column({ nullable: false })
  walletNumber: string;

  @Column()
  currency: string;

  @OneToOne(() => UserEntity, (user) => user.wallet, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
