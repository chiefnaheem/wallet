import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserEntity } from './user.entity';
export enum transactionType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

export enum TransactionChannel {
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  IN_APP = 'IN_APP',
}




@Entity({ name: 'transaction' })
export class TransactionEntity extends BaseEntity {
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  currentBalance: string;

  @Column({ nullable: true })
  previousBalance: string;

  @Column({ nullable: true })
  sender: string;

  @Column({ nullable: true })
  receiver: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reason: string;

  @Column()
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  request: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column()
  reference: string;

  @Column({ nullable: true })
  uniqueCode: string;



  @Column({
    type: 'enum',
    enum: TransactionChannel,
    default: TransactionChannel.IN_APP,
  })
  transactionChannel: TransactionChannel;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.transactions, {
    nullable: true,
  })
  paymentTo: UserEntity;
}
