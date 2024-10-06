import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReplyMessageDto {
  @IsInt()
  @IsNotEmpty()
  readonly userId: number;

  @IsString()
  @IsNotEmpty()
  readonly reply: string;

  @IsUUID()
  @IsNotEmpty()
  readonly originalMessageId: string;
}
