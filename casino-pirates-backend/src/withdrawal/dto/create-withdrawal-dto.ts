import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @ApiProperty({ example: '1' })
  userId: number;
  @ApiProperty({ example: '1' })
  @IsNumber()
  amount: number;
  @ApiProperty({ example: '1' })
  @IsNumber()
  chainId: number;
  @ApiProperty({ example: '1' })
  @IsNumber()
  currencyId: number;
}
