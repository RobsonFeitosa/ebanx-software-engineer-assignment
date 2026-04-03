import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum EventType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateEventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
