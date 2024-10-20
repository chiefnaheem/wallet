import { GetCurrentUser } from '@gowagr/common/decorators/get-current-user.decorator';
import { ResponseDto } from '@gowagr/common/interface/response.interface';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FilterTransactionsDto, TransferFundsDto } from '../dto/index.dto';
import { TransactionService } from '../service/transactions.service';

@ApiTags('Transactions')
@Controller('transfers')
@ApiBearerAuth('Bearer')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get transaction history of logged in user',
  })
  async getHistory(
    @GetCurrentUser('uid') uid: string,
    @Query() query: FilterTransactionsDto,
  ): Promise<ResponseDto> {
    const {
      page,
      limit,
      transactionType,
      transactionChannel,
      status,
      fromDate,
      toDate,
    } = query;
    const profile = await this.transactionService.getTransactionHistory(
      uid,
      page,
      limit,
      { transactionChannel, transactionType, status, fromDate, toDate },
    );
    return {
      statusCode: 200,
      message: 'successfully fetched transaction history',
      data: profile,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Transfer to another user',
  })
  @UseGuards(ThrottlerGuard)
  async transfer(
    @GetCurrentUser('uid') uid: string,
    @Body() payload: TransferFundsDto,
  ): Promise<ResponseDto> {
    await this.transactionService.transferFunds(
      uid,
      payload.receiverId,
      payload.amount,
    );
    return {
      statusCode: 200,
      message: 'Funds transferred successfully',
    };
  }
}
