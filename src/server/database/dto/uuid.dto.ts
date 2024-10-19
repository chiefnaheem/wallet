import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UuidParamDto {
  @ApiProperty({ example: '573c7e4d-9ae3-415b-abac-d8fd3fd5c8' })
  @IsUUID()
  id: string;
}
