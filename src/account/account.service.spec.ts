import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { EventType } from './dto/create-event.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AccountService', () => {
  let service: AccountService;
  let repository: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, AccountRepository],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repository = module.get<AccountRepository>(AccountRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resetAll', () => {
    it('should clear all accounts in repository', () => {
      repository.save('100', 10);
      service.resetAll();
      expect(repository.findBalance('100')).toBeUndefined();
    });
  });

  describe('getBalance', () => {
    it('should return balance if account exists', () => {
      repository.save('100', 20);
      expect(service.getBalance('100')).toBe(20);
    });

    it('should throw NotFoundException if account does not exist', () => {
      expect(() => service.getBalance('999')).toThrow(NotFoundException);
    });
  });

  describe('executeEvent', () => {
    describe('DEPOSIT', () => {
      it('should create a new account with the deposited amount', () => {
        const result = service.executeEvent({
          type: EventType.DEPOSIT,
          destination: '100',
          amount: 10
        });

        expect(result).toEqual({
          destination: { id: '100', balance: 10 }
        });
        expect(repository.findBalance('100')).toBe(10);
      });

      it('should add to the existing account balance', () => {
        repository.save('100', 10);
        const result = service.executeEvent({
          type: EventType.DEPOSIT,
          destination: '100',
          amount: 10
        });

        expect(result).toEqual({
          destination: { id: '100', balance: 20 }
        });
      });
    });

    describe('WITHDRAW', () => {
      it('should throw NotFoundException if account does not exist', () => {
        expect(() => service.executeEvent({
          type: EventType.WITHDRAW,
          origin: '200',
          amount: 10
        })).toThrow(NotFoundException);
      });

      it('should throw BadRequestException if balance is insufficient', () => {
        repository.save('100', 10);
        expect(() => service.executeEvent({
          type: EventType.WITHDRAW,
          origin: '100',
          amount: 20
        })).toThrow(BadRequestException);
      });

      it('should subtract from the existing account balance', () => {
        repository.save('100', 20);
        const result = service.executeEvent({
          type: EventType.WITHDRAW,
          origin: '100',
          amount: 5
        });

        expect(result).toEqual({
          origin: { id: '100', balance: 15 }
        });
        expect(repository.findBalance('100')).toBe(15);
      });
    });

    describe('TRANSFER', () => {
      it('should throw NotFoundException if origin account does not exist', () => {
        expect(() => service.executeEvent({
          type: EventType.TRANSFER,
          origin: '100',
          destination: '300',
          amount: 15
        })).toThrow(NotFoundException);
      });

      it('should throw BadRequestException if origin balance is insufficient', () => {
        repository.save('100', 5);
        expect(() => service.executeEvent({
          type: EventType.TRANSFER,
          origin: '100',
          destination: '300',
          amount: 10
        })).toThrow(BadRequestException);
      });

      it('should transfer from origin to destination', () => {
        repository.save('100', 15);
        const result = service.executeEvent({
          type: EventType.TRANSFER,
          origin: '100',
          destination: '300',
          amount: 15
        });

        expect(result).toEqual({
          origin: { id: '100', balance: 0 },
          destination: { id: '300', balance: 15 }
        });
        expect(repository.findBalance('100')).toBe(0);
        expect(repository.findBalance('300')).toBe(15);
      });
    });

    it('should throw BadRequestException for unknown event type', () => {
      expect(() => service.executeEvent({
        type: 'invalid' as any,
        amount: 10
      })).toThrow(BadRequestException);
    });
  });
});
