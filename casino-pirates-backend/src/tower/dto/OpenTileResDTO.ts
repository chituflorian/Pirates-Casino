import { Equals, IsBoolean, IsNumber, IsPositive, Min } from 'class-validator';

export interface OpenTileResDTO {
  gameOver: boolean;
  blockPosition: number;
  isTower: boolean;
  userMap: number[][];
  generatedMap?: number[][];
  state: string;
  activeRow: number | null;
  profit: number;
  multiplier: number;
}

export class OpenTileSafeBlockResDTO implements OpenTileResDTO {
  @IsBoolean()
  gameOver: boolean;

  @IsNumber()
  @Min(0)
  blockPosition: number;

  @IsBoolean()
  isTower: boolean;

  userMap: number[][];

  @Equals('IN_PROGRESS')
  state: string;

  @Min(0)
  activeRow: number;

  @IsPositive()
  profit: number;

  @IsPositive()
  multiplier: number;
}

export class OpenTileSafeBlockCashedOutResDTO implements OpenTileResDTO {
  @IsBoolean()
  gameOver: boolean;

  @IsNumber()
  @Min(0)
  blockPosition: number;

  @IsBoolean()
  isTower: boolean;

  userMap: number[][];

  @Equals('CASHED_OUT')
  state: string;

  @Min(0)
  activeRow: number;

  @IsPositive()
  profit: number;

  @IsPositive()
  multiplier: number;
}

export class OpenTileUnSafeBlockResDTO implements OpenTileResDTO {
  @IsBoolean()
  gameOver: boolean;

  @IsNumber()
  @Min(0)
  blockPosition: number;

  @IsBoolean()
  isTower: boolean;

  userMap: number[][];

  generatedMap: number[][];

  @Equals('LOST')
  state: string;

  activeRow: null;

  @IsNumber()
  @Equals(0)
  profit: number;

  @IsNumber()
  multiplier: number;
}
