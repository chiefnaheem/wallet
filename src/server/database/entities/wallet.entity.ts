import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import {  UserEntity } from './user.entity';

@Entity({ name: 'wallets' })
export class WalletEntity extends BaseEntity {
  @Column({ nullable: false })
  balance: string;

  @Column({ nullable: false })
  ledgerBalance: string;

  @Column()
  currency: string;

  @OneToOne(() => UserEntity, (user) => user.wallet, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
