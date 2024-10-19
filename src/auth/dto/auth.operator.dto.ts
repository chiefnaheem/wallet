import {
  GenderEnum,
  PlatformTypesEnum,
} from '@alpharide/server/database/entities/account.entity';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class OperatorSignUpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // Allow any valid phone number format
  @IsPhoneNumber(null, { message: 'phoneNumber must be a valid phone number' })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
    enum: PlatformTypesEnum,
    example: PlatformTypesEnum.OPERATOR_INDIVIDUAL,
  })
  @IsEnum(PlatformTypesEnum)
  @IsNotEmpty()
  @IsIn(
    [PlatformTypesEnum.OPERATOR_INDIVIDUAL, PlatformTypesEnum.OPERATOR_COMPANY],
    {
      message: 'Platform must be OPERATOR_INDIVIDUAL or OPERATOR_COMPANY',
    },
  )
  @IsNotEmpty()
  platform: PlatformTypesEnum;
}

export class OperatorLoginDto extends PickType(OperatorSignUpDto, [
  'email',
  'password',
] as const) {}

export class OprSendOtpDto extends PickType(OperatorSignUpDto, [
  'email',
] as const) {}

export class VerifyOtpForgotPassDto extends PickType(OperatorSignUpDto, [
  'email',
] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class OprResetPassDto extends PickType(OperatorSignUpDto, [
  'email',
  'password',
] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class OperStaffInviteRegDto extends PickType(OperatorSignUpDto, [
  'password',
  'phoneNumber',
] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    type: String,
    enum: GenderEnum,
    example: GenderEnum.MALE,
  })
  @IsEnum(GenderEnum)
  @IsNotEmpty()
  gender: GenderEnum;

  @ApiProperty()
  @IsString()
  @IsOptional()
  profileImage: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secret: string;
}

export class AddBusinessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyRegNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stateOfOperation: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  logo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fleetType: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  noOfEmployee: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  industry: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  services: string;
}
