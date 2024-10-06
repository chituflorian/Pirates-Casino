import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetConfigValueDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'game.property' })
  key: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '50' })
  value: string;
}
