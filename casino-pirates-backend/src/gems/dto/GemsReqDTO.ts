import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { IsDifficulty } from './Validator';
import { ApiProperty } from '@nestjs/swagger';

export class GemsReqDTO {
  @ApiProperty({ example: 'EASY' })
  @IsNotEmpty()
  @IsString()
  @IsDifficulty({
    message:
      'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD',
  })
  difficulty: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: '50' })
  amount: number;
}
