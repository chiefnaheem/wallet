import { BaseEntity } from '../base.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { WalletEntity } from './wallet.entity';
import { TransactionEntity } from './transaction.entity';

export enum AccountStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
  WARNED = 'WARNED',
}

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum SignupMediumEnum {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}

export enum DriverTypeEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
}

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column({ length: 100, type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ length: 100, unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ length: 100, type: 'varchar', nullable: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  nin: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  signupMedium: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'text', nullable: true })
  accessToken: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  isPhoneNumberVerfied: boolean;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ nullable: true })
  phoneNumberVerifiedAt: Date;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    nullable: true,
    default: AccountStatusEnum.ACTIVE,
  })
  accountStatus: AccountStatusEnum;

  @Column({ type: 'enum', enum: Object.values(GenderEnum), nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, default: new Date() })
  lastLoggedIn: Date;

  @OneToOne(() => WalletEntity, { cascade: ['insert', 'update'] })
  @JoinColumn()
  wallet: WalletEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];
}
