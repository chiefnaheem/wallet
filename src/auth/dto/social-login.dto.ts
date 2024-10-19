import { LocationDto } from '@alpharide/routes/dto/routes.dto';
import { PlatformTypesEnum } from '@alpharide/server/database/entities/account.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SocialLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty({ type: LocationDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  userLocation: LocationDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(PlatformTypesEnum)
  platform: PlatformTypesEnum;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  nin: string;
}

export class AppleLoginDto extends PickType(SocialLoginDto, [
  'firstName',
  'lastName',
  'state',
  'platform',
  'nin',
  'userLocation',
] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appleId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;
}
