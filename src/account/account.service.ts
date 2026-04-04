import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    switch (dto.type) {
      case EventType.DEPOSIT:
        return this.handleDeposit(dto.destination!, dto.amount);

      case EventType.WITHDRAW:
        return this.handleWithdraw(dto.origin!, dto.amount);

      case EventType.TRANSFER:
        return this.handleTransfer(dto.origin!, dto.destination!, dto.amount);

      default:
        throw new BadRequestException('Invalid event type');
    }
  }

  resetAll() {
    this.repository.reset();
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

  private handleWithdraw(originId: string, amount: number) {
    const currentBalance = this.repository.findBalance(originId);

    if (currentBalance === undefined) {
      throw new NotFoundException(0);
    }

    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const newBalance = currentBalance - amount;

    this.repository.save(originId, newBalance);

    return {
      origin: {
        id: originId,
        balance: newBalance,
      },
    };
  }

  private handleTransfer(originId: string, destinationId: string, amount: number) {
    const originBalance = this.repository.findBalance(originId);

    if (originBalance === undefined) {
      throw new NotFoundException(0);
    }

    if (originBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const newOriginBalance = originBalance - amount;
    this.repository.save(originId, newOriginBalance);

    const destinationBalance = this.repository.findBalance(destinationId) ?? 0;
    const newDestinationBalance = destinationBalance + amount;
    this.repository.save(destinationId, newDestinationBalance);

    return {
      origin: {
        id: originId,
        balance: newOriginBalance,
      },
      destination: {
        id: destinationId,
        balance: newDestinationBalance,
      },
    };
  }
}
