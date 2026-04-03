import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { CreateEventDto, EventType } from './dto/create-event.dto';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  getBalance(accountId: string): number {
    const balance = this.repository.findBalance(accountId);

    if (balance === undefined) {
      throw new NotFoundException(0);
    }

    return balance;
  }

  executeEvent(dto: CreateEventDto) {
    if (dto.type === EventType.DEPOSIT) {
      return this.handleDeposit(dto.destination!, dto.amount);
    }
  }

  private handleDeposit(destinationId: string, amount: number) {
    const currentBalance = this.repository.findBalance(destinationId) ?? 0;
    const newBalance = currentBalance + amount;

    this.repository.save(destinationId, newBalance);

    return {
      destination: {
        id: destinationId,
        balance: newBalance,
      },
    };
  }
}
