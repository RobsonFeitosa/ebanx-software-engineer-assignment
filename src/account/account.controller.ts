import { Controller, Get, Post, Body, Query, HttpCode } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('account')
@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get balance for an account' })
  getBalance(@Query('account_id') accountId: string): number {
    return this.accountService.getBalance(accountId);
  }

  @Post('event')
  @HttpCode(201)
  @ApiOperation({ summary: 'Execute an event (deposit, withdraw, transfer)' })
  createEvent(@Body() dto: CreateEventDto) {
    return this.accountService.executeEvent(dto);
  }
}
