/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponseType } from './types/login-response.type';
import { User } from '../users/entities/user.entity';
import { User as UserDecorator, UserEntity } from '../users/users.decorator';
import { NullableType } from '../utils/types/nullable.type';
import { LinkWalletDto } from './dto/link-wallet.dto';
import { MessageRequestDto } from './dto/message-request.dto';
import { LoginDTO } from './dto/login.dto';
import { WrapResponse } from '../utils/decorators/wrap-response';
import { BlockchainService } from '../blockchain/blockchain.service';

@ApiTags('Auth')
@Controller({
  path: 'auth',
})
@WrapResponse()
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('login-or-register')
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: LoginDTO): Promise<LoginResponseType> {
    return this.service.validateLogin(loginDto);
  }

  @Post('message')
  @HttpCode(HttpStatus.OK)
  public getMessage(@Body() payload: MessageRequestDto): string {
    return this.blockchainService.addWalletToCache(payload.walletAddress);
  }

  @Patch('link')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  public async linkWallet(
    @Body() linkWalletDto: LoginDTO,
    @UserDecorator() user: UserEntity,
  ): Promise<void> {
    await this.service.linkWallet(user.id, linkWalletDto);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<Omit<LoginResponseType, 'user'>> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }
}
