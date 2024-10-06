import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
export class OpenTileReqDTO {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: '22104710-50b9-4a8d-8008-852eeaf1dbb9' })
  gameId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: '1' })
  tilePosition: number;
}
