import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import ms from 'ms';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseType } from './types/login-response.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { SessionService } from '../session/session.service';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { Session } from '../session/entities/session.entity';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { LoginDTO } from './dto/login.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private configService: ConfigService<AllConfigType>,
    private blockchainService: BlockchainService,
  ) {}

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
        // Other options can be included if necessary
      });

      // Assuming that we store the user ID in the token, we could then fetch the user from the database
      const user = await this.usersService.findOne({ id: decoded.id });
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  async validateLogin(loginDto: LoginDTO): Promise<LoginResponseType> {
    const signature = this.blockchainService.getMessageFromCache(
      loginDto.address,
    );
    if (!signature) {
      throw new BadRequestException('No message found for this wallet address');
    }

    const isValidPassword = await this.blockchainService.verifyEvmSignature(
      loginDto.signature,
      loginDto.address,
      signature,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid signature');
    }
    let user = await this.usersService.findOneByWallet(loginDto.address);
    if (!user) {
      user = await this.usersService.create(loginDto);
    }

    const session = await this.sessionService.create({
      user,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findOne({
      id: userJwtPayload.id,
    });
  }

  // src/auth/auth.service.ts

  async linkWallet(userId: number, loginDto: LoginDTO): Promise<void> {
    const message = await this.blockchainService.getMessageFromCache(
      loginDto.address,
    );

    if (!message) {
      throw new BadRequestException(
        'No signature request found for this wallet address',
      );
    }

    const isValidSignature = this.blockchainService.verifyEvmSignature(
      loginDto.signature,
      loginDto.address,
      message,
    );

    if (!isValidSignature) {
      throw new BadRequestException('Invalid signature');
    }

    // Find the user by userId
    const user = await this.usersService.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create and save the new wallet
    await this.usersService.linkWallet(user, loginDto);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId'>,
  ): Promise<Omit<LoginResponseType, 'user'>> {
    const session = await this.sessionService.findOne({
      where: {
        id: data.sessionId,
      },
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.softDelete({
      id: data.sessionId,
    });
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
