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
import { RequestEntity } from '@alpharide/server/database/entities/request.entity';
import { DeliveryEntity } from '@alpharide/server/database/entities/delivery.entity';
import { TransactionEntity } from '@alpharide/server/database/entities/transaction.entity';
import { GoalEntity } from '@alpharide/server/database/entities/goal.entity';
import { WalletEntity } from '@alpharide/server/database/entities/wallet.entity';
import { TripAnnouncementEntity } from '@alpharide/server/database/entities/tripAnnouncement.entity';
import { ReviewEntity } from '@alpharide/server/database/entities/review.entity';
import { ReferAndEarnEntity } from '@alpharide/server/database/entities/referAndEarn.entity';
import { RouteEntity } from './routes.entity';
import { EmergencyEntity } from './emergency.entity';
import { TransportEntity } from './transportation.entity';
import { CardEntity } from './cards.entity';
import { OrderEntity } from './order.entity';
import { PayloadEntity } from './payload.entity';
import { CompanyEntity } from './company.entity';
import { FleetEntity } from './fleet.entity';
import { OnboardingEntity } from './onboarding.entity';
import { AccountDetailsEntity } from './accountDetails.entity';
import { DriverCertEntity } from './driverCertificate.entity';
import { FcmTokenEntity } from './fcmToken.entity';
import { Location } from './location.entity';
import { Rating } from './rating.entity';

export enum VerificationStatusEnum {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
}

export enum AccountStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
  WARNED = 'WARNED',
}

export enum PlatformTypesEnum {
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  OPERATOR_INDIVIDUAL = 'OPERATOR_INDIVIDUAL',
  OPERATOR_COMPANY = 'OPERATOR_COMPANY',
  BUSINESS = 'BUSINESS',
  ONLINE_VENDOR = 'ONLINE_VENDOR',
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

@Entity({ name: 'accounts' })
export class AccountEntity extends BaseEntity {
  @Column({ length: 100, type: 'varchar', unique: true, nullable: true })
  appleId: string;

  @Column({ nullable: true, default: 1 })
  userLevel: number;

  @Column({ length: 100, type: 'varchar', unique: true, nullable: true })
  email: string;

  @Exclude()
  @Column({ length: 100, type: 'varchar', nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, type: 'jsonb' })
  userLocation: {
    latitude: string;
    longitude: string;
    formattedAddress: string;
  };

  @Column({ nullable: true })
  birthDay: string;

  @Column({ nullable: true })
  age: string;

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

  @Column({ type: 'boolean', nullable: true })
  isBusinessAdded: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  isPhoneNumberVerfied: boolean;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ nullable: true })
  phoneNumberVerifiedAt: Date;

  @Column({
    type: 'enum',
    enum: VerificationStatusEnum,
    nullable: true,
    default: VerificationStatusEnum.UNVERIFIED,
  })
  verificationStatus: VerificationStatusEnum;

  @Column({
    type: 'enum',
    enum: DriverTypeEnum,
    nullable: true,
    default: DriverTypeEnum.INDIVIDUAL,
  })
  driverType: DriverTypeEnum;

  @Column({
    type: 'enum',
    enum: PlatformTypesEnum,
    nullable: false,
  })
  platform: PlatformTypesEnum;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    nullable: true,
    default: AccountStatusEnum.ACTIVE,
  })
  accountStatus: AccountStatusEnum;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  primaryLocation: string;

  @Column({ type: 'enum', enum: Object.values(GenderEnum), nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ type: 'bool', default: true })
  notifyPolice: boolean;

  @Column({ type: 'bool', default: true })
  notifyAlpha: boolean;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  customerCode: string;

  @Column({ nullable: true })
  cardToken: string;

  @Column({ type: 'bool', default: false })
  isOnboardingCompleted: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  isActive: boolean;

  @Column({ nullable: true, default: new Date() })
  lastLoggedIn: Date;

  @OneToMany(() => RequestEntity, (request) => request.user)
  requests: RequestEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.user)
  deliveries: DeliveryEntity[];

  @OneToMany(() => TransportEntity, (transport) => transport.user)
  transportation: TransportEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];

  @OneToMany(() => GoalEntity, (goal) => goal.user)
  goals: GoalEntity[];

  @OneToMany(() => RouteEntity, (routes) => routes.user, { nullable: true })
  routes: RouteEntity[];

  @OneToOne(() => WalletEntity, (wallet) => wallet.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  wallet: WalletEntity;

  @OneToMany(() => AccountDetailsEntity, (account) => account.user, {
    nullable: true,
  })
  @JoinColumn()
  accountDetails: AccountDetailsEntity;

  @OneToMany(
    () => TripAnnouncementEntity,
    (tripAnnouncement) => tripAnnouncement.user,
  )
  tripAnnouncements: TripAnnouncementEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.driver)
  reviews: ReviewEntity[];

  @OneToMany(() => ReferAndEarnEntity, (referAndEarn) => referAndEarn.user)
  referAndEarns: ReferAndEarnEntity[];

  @ManyToOne(() => AccountEntity, (account) => account.referrals)
  @JoinColumn({ name: 'referredBy' })
  referredBy: AccountEntity;

  @Column({ nullable: true })
  onboardingStep: string;

  @OneToMany(() => AccountEntity, (account) => account.referredBy)
  referrals: AccountEntity[];

  @OneToMany(() => EmergencyEntity, (emergency) => emergency.user)
  emergencies: EmergencyEntity[];

  @OneToMany((type) => CardEntity, (card) => card.user)
  cards?: CardEntity[];

  @OneToMany((type) => OrderEntity, (order) => order.user)
  order?: OrderEntity[];

  @OneToMany((type) => PayloadEntity, (payload) => payload.user)
  payload?: PayloadEntity[];

  @OneToMany((type) => CompanyEntity, (company) => company.user)
  company?: CompanyEntity[];

  @OneToMany((type) => FleetEntity, (fleet) => fleet.user)
  fleet: FleetEntity[];

  @OneToMany((type) => FleetEntity, (fleet) => fleet.driver)
  fleetDriver: FleetEntity[];

  @OneToMany((type) => DriverCertEntity, (driverCert) => driverCert.driver)
  driverCert: DriverCertEntity[];

  @OneToMany(() => TripAnnouncementEntity, (trip) => trip.driver, {
    nullable: true,
  })
  @JoinColumn()
  trip: TripAnnouncementEntity[];

  @OneToMany(() => FcmTokenEntity, (fcmToken) => fcmToken.user)
  fcmToken: FcmTokenEntity[];

  @OneToOne(() => OnboardingEntity, (onboarding) => onboarding.user, {
    eager: true,
  }) // or { lazy: true } if you want to fetch it manually
  @JoinColumn()
  onboarding: OnboardingEntity;

  @OneToMany(() => Location, (location) => location.driver)
  locations: Location[];

  @OneToMany(() => Rating, (rating) => rating.driver)
  ratings: Rating[];
}
