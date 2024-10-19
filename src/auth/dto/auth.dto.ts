import { AccountDto } from '@alpharide/account/dto/account.dto';
import { PlatformTypesEnum } from '@alpharide/server/database/entities/account.entity';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class ResendVerificationEmailDto extends PickType(AccountDto, [
  'email',
  'platform',
] as const) {}

// export class InviteUserDto extends PickType(ResendVerificationEmailDto, [
//   'email',
// ] as const) {}

export class InviteUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone: string;
}

export class VerifyEmailDto extends PickType(AccountDto, ['email'] as const) {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class VerifyPhoneNumberDto extends PickType(AccountDto, [
  'phoneNumber',
] as const) {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class SendPhoneNumberDto extends PickType(AccountDto, [
  'phoneNumber',
  'platform',
] as const) {
  @ApiPropertyOptional({ type: String, example: 'demo@ride.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isWeb: boolean;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isLogin: boolean;
}

export class SearchReferralDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  searchCode: string;
}

export class ForgotPasswordDto extends PickType(AccountDto, [
  'email',
] as const) {}

export class ResetPasswordDto extends PickType(AccountDto, ['email'] as const) {
  // @ApiProperty({ type: String })
  // @IsNotEmpty()
  // @IsString()
  // code: string;

  @ApiProperty({
    type: String,
    example: 'Password@123',
    description:
      'Password must be at least 8 characters long and contain at least one letter and one number',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
