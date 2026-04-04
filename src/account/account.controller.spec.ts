import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { EventType } from './dto/create-event.dto';
import { NotFoundException } from '@nestjs/common';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [AccountService, AccountRepository],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reset', () => {
    it('should reset all accounts', () => {
      const resetSpy = jest.spyOn(service, 'resetAll');
      expect(controller.reset()).toBe('OK');
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return balance for an existing account', () => {
      jest.spyOn(service, 'getBalance').mockReturnValue(100);
      expect(controller.getBalance('123')).toBe(100);
    });

    it('should throw NotFoundException if account does not exist', () => {
      jest.spyOn(service, 'getBalance').mockImplementation(() => {
        throw new NotFoundException(0);
      });
      expect(() => controller.getBalance('non-existent')).toThrow(NotFoundException);
    });
  });

  describe('createEvent', () => {
    it('should handle DEPOSIT event', () => {
      const depositResult = { destination: { id: '100', balance: 10 } };
      jest.spyOn(service, 'executeEvent').mockReturnValue(depositResult);

      expect(controller.createEvent({
        type: EventType.DEPOSIT,
        destination: '100',
        amount: 10
      })).toEqual(depositResult);
    });

    it('should handle WITHDRAW event', () => {
      const withdrawResult = { origin: { id: '100', balance: 5 } };
      jest.spyOn(service, 'executeEvent').mockReturnValue(withdrawResult);

      expect(controller.createEvent({
        type: EventType.WITHDRAW,
        origin: '100',
        amount: 5
      })).toEqual(withdrawResult);
    });

    it('should handle TRANSFER event', () => {
      const transferResult = {
        origin: { id: '100', balance: 0 },
        destination: { id: '300', balance: 15 }
      };
      jest.spyOn(service, 'executeEvent').mockReturnValue(transferResult);

      expect(controller.createEvent({
        type: EventType.TRANSFER,
        origin: '100',
        destination: '300',
        amount: 15
      })).toEqual(transferResult);
    });
  });
});
