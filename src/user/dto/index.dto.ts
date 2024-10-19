import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsPhoneNumber,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { AccountStatusEnum, GenderEnum, SignupMediumEnum } from '@gowagr/server/database/entities/user.entity';


export class UserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: false,
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'User address',
    required: false,
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth (YYYY-MM-DD)',
    required: false,
  })
  @IsString()
  @IsOptional()
  dob: string;

  @ApiProperty({
    example: 'A12345678',
    description: 'Password',
    required: false,
  })
  @IsString()
  @Min(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'URL of the user profile image',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage: string;

  @ApiProperty({
    example: SignupMediumEnum.WEB,
    enum: SignupMediumEnum,
    description: 'Medium the user used to sign up',
    required: false,
  })
  @IsEnum(SignupMediumEnum)
  @IsOptional()
  signupMedium: SignupMediumEnum;

  @ApiProperty({
    example: true,
    description: 'Is the email verified?',
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified: boolean;

  @ApiProperty({
    example: true,
    description: 'Is the phone number verified?',
  })
  @IsBoolean()
  @IsOptional()
  isPhoneNumberVerified: boolean;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Date and time when email was verified',
    required: false,
  })
  @IsDate()
  @IsOptional()
  emailVerifiedAt: Date;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Date and time when phone number was verified',
    required: false,
  })
  @IsDate()
  @IsOptional()
  phoneNumberVerifiedAt: Date;

  @ApiProperty({
    example: AccountStatusEnum.ACTIVE,
    enum: AccountStatusEnum,
    description: 'Current status of the account',
    required: false,
  })
  @IsEnum(AccountStatusEnum)
  @IsOptional()
  accountStatus: AccountStatusEnum;

  @ApiProperty({
    example: GenderEnum.MALE,
    enum: GenderEnum,
    description: 'Gender of the user',
    required: false,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender: GenderEnum;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    required: false,
  })
  @IsPhoneNumber(null, { message: 'Phone number must be valid' })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    example: '2023-10-13T12:00:00Z',
    description: 'Last login date of the user',
    required: false,
  })
  @IsDate()
  @IsOptional()
  lastLoggedIn: Date;
}


export class CreateUserDto extends PickType(UserDto, ['email', 'password', 'firstName', 'lastName', 'signupMedium', 'phoneNumber', 'dob']){}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'])) {}