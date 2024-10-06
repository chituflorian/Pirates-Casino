import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @IsNotEmpty()
  readonly userId: number;

  @IsString()
  @IsNotEmpty()
  readonly message: string;
}
