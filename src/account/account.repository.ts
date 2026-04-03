import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountRepository {
  private accounts = new Map<string, number>();

  findBalance(id: string): number | undefined {
    return this.accounts.get(id);
  }

  save(id: string, balance: number): void {
    this.accounts.set(id, balance);
  }
}
