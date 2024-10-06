import { ApiProperty } from '@nestjs/swagger';
import { IsString, Min, IsNotEmpty, IsInt } from 'class-validator';

export class OpenTileDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '22104710-50b9-4a8d-8008-852eeaf1dbb9' })
  gameId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({ example: '0' })
  x: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({ example: '1' })
  y: number;
}
