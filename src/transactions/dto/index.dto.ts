import { PaginationDto } from '@gowagr/common/dto/common.dto';
import {
  TransactionChannel,
  TransactionStatusEnum,
  transactionType,
} from '@gowagr/server/database/entities/transaction.entity';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FilterTransactionsDto extends PickType(PaginationDto, [
  'page',
  'limit',
] as const) {
  @ApiPropertyOptional({
    description: 'Type of transaction: INFLOW or OUTFLOW',
    enum: transactionType,
    example: transactionType.INFLOW,
  })
  @IsOptional()
  @IsEnum(transactionType, {
    message: 'transactionType must be INFLOW or OUTFLOW',
  })
  transactionType?: transactionType;

  @ApiPropertyOptional({
    description: 'Channel of transaction: CARD, TRANSFER, or IN_APP',
    enum: TransactionChannel,
    example: TransactionChannel.TRANSFER,
  })
  @IsOptional()
  @IsEnum(TransactionChannel, {
    message: 'transactionChannel must be CARD, TRANSFER, or IN_APP',
  })
  transactionChannel?: TransactionChannel;

  @ApiPropertyOptional({
    description: 'Status of the transaction (e.g., COMPLETED, PENDING)',
    enum: TransactionStatusEnum,
    example: TransactionStatusEnum.SUCCESS,
  })
  @IsOptional()
  @IsEnum(TransactionStatusEnum, {
    message: 'status must be one of SUCCESS, FAILED',
  })
  status?: TransactionStatusEnum;

  @ApiPropertyOptional({
    description: 'Start date for filtering transactions (YYYY-MM-DD format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString({ message: 'fromDate must be a valid date string' })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering transactions (YYYY-MM-DD format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString({ message: 'toDate must be a valid date string' })
  toDate?: string;
}

export class TransferFundsDto {
  @ApiProperty({
    description: 'Receiver id',
    example: '2024-01-01',
  })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    description: 'Amount to b transferred',
    example: 20,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
