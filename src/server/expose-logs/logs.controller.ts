import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';

@ApiTags('server-logs')
@Controller('error-logs')
export class LogsController {
  constructor(private readonly tailService: LogsService) {}

  @Get()
  @Public()
  async getErrorLogs(): Promise<string> {
    try {
      const errorLogs = await this.tailService.readErrorLogs();
      return errorLogs;
    } catch (error) {
      // Handle errors, e.g., log and return an appropriate response
      Logger.error('Error reading error logs:', error);
      return 'Failed to retrieve error logs.';
    }
  }
}
