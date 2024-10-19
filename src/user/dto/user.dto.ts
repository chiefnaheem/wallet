import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsJSON,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@rekenplus/database/entities/user.entity';

class BusinessDetailsDto {
  @ApiProperty({ description: 'Name of the business' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ description: 'Address of the business' })
  @IsString()
  @IsNotEmpty()
  businessAddress: string;

  @ApiProperty({ description: 'Logo of the business' })
  @IsString()
  @IsNotEmpty()
  businessLogo: string;

  @ApiProperty({ description: 'Phone number of the business' })
  @IsString()
  @IsNotEmpty()
  businessPhoneNumber: string;
}

class ContactDetailsDto {
  @ApiProperty({ description: 'Contact address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact zip code' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'Email of the user', uniqueItems: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ description: 'Name of the user' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ description: 'Verification status of the user' })
  @IsBoolean()
  @IsOptional()
  isVerified: boolean;

  @ApiProperty({ description: 'OTP for user verification' })
  @IsString()
  @IsOptional()
  otp: string;

  @ApiProperty({ description: 'Role of the user', enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @ApiProperty({ description: 'Apple ID of the user' })
  @IsString()
  @IsOptional()
  appleId: string;

  @ApiProperty({ description: 'OTP expiration date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  otpExpiresAt: Date;

  @ApiProperty({ description: 'Date when the email was verified' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  emailVerifiedAt: Date;

  @ApiProperty({
    description: 'Business details of the user',
    type: BusinessDetailsDto,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => BusinessDetailsDto)
  businessDetails: BusinessDetailsDto;

  @ApiProperty({
    description: 'Contact details of the user',
    type: ContactDetailsDto,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => ContactDetailsDto)
  contactDetails: ContactDetailsDto;

  @ApiProperty({ description: 'Date of birth of the user' })
  @IsString()
  @IsOptional()
  dateOfBirth: string;

  @ApiProperty({ description: 'Age of the user' })
  @IsNumber()
  @IsOptional()
  age: number;
}

export class UpdateUserDto extends PickType(CreateUserDto, [
  'businessDetails',
  'contactDetails',
  'dateOfBirth',
  'name',
]) {}
