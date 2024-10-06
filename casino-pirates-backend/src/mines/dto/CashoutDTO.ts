import { IsString } from 'class-validator';

export class CashoutDTO {
  @IsString()
  gameId: string;
}
