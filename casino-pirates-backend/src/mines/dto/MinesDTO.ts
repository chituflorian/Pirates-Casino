import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class MinesCreateDTO {
  @IsInt()
  @ApiProperty({ example: '4' })
  mines: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: '1' })
  amount: number;
}
