import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsExist } from '../../utils/validators/is-exists.validator';

export class LoginDTO {
  @ApiProperty({ description: 'The signature of the user' })
  @IsString()
  signature: string;

  @ApiProperty({ description: 'The address of the user' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'The chain type id of the user' })
  @IsNumber()
  @Validate(IsExist, ['ChainType', 'id'], {
    message: 'ChainType with this id does not exist',
  })
  chainTypeId: number;
}
