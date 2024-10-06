import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class LikeMessageDto {
  @IsInt()
  @IsNotEmpty()
  readonly userId: number;

  @IsUUID()
  @IsNotEmpty()
  readonly messageId: string;
}
