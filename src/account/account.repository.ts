import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountRepository {
  private accounts = new Map<string, number>();

  findById(id: string): number | undefined {
    return this.accounts.get(id);
  }

  upsert(id: string, balance: number): void {
    this.accounts.set(id, balance);
  }
}
