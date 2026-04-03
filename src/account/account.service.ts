import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from './account.repository';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  getBalance(accountId: string): number {
    const balance = this.repository.findById(accountId);

    if (balance === undefined) {
      throw new NotFoundException(0); 
    }

    return balance;
  }
}
