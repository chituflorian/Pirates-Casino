import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LinkWalletDto {
  @ApiProperty({
    description: 'The wallet address to link to the user account',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'The signature of the wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  signature: string;

  //define the chain
  @ApiProperty({
    description: 'The chain the wallet address is on',
    example: 'ethereum',
  })
  @IsString()
  chainId: string;
}
