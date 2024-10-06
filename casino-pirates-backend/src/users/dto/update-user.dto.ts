import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, Validate } from 'class-validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';
import { FileEntity } from '../../files/entities/file.entity';
import { IsExist } from '../../utils/validators/is-exists.validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(4)
  @IsOptional()
  @Validate(IsNotExist, ['User'], {
    message: 'refferalCodeAlreadyExists',
  })
  refferalCode?: string | null;

  @ApiProperty({ type: () => FileEntity })
  @IsOptional()
  @Validate(IsExist, ['FileEntity', 'id'], {
    message: 'imageNotExists',
  })
  photo?: FileEntity | null;
}
