import { Controller, Get, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('balance')
@Controller('balance')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get balance for an account' })
  getBalance(@Query('account_id') accountId: string): number {
    return this.accountService.getBalance(accountId);
  }
}
