import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { IsDifficulty } from './Validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTowerReqDTO {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: '10' })
  betAmount: number;
  @IsString()
  @IsNotEmpty()
  @IsDifficulty({
    message:
      'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD EXTREME NIGHTMARE',
  })
  @ApiProperty({ example: 'EASY' })
  difficulty: string;
}
