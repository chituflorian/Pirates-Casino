import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { TowerService } from './tower.service';
import { User, UserEntity } from '../users/users.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { CreateTowerReqDTO } from './dto/CreateTowerReqDTO';
import { OpenTileReqDTO } from './dto/OpenTileReqDTO';
import NodeCache from 'node-cache';
import { LockRequest } from '../utils/decorators/lock-request';
import { Tower } from './entities/tower.entity';
import { WrapResponse } from '../utils/decorators/wrap-response';
import { OpenTileResDTO } from './dto/OpenTileResDTO';
import { CreateTowerRespDTO } from './dto/CreateTowerRespDTO';
import { ITower } from './interface/ITower.interface';

@Controller('tower')
@ApiBearerAuth()
@Roles(RoleEnum.user)
@UseGuards(AuthGuard('jwt'))
@ApiTags('Tower')
@WrapResponse()
export class TowerController {
  private static readonly nodeCache = new NodeCache({
    deleteOnExpire: true,
    stdTTL: 30,
  });
  constructor(private towerService: TowerService) {}

  @Post('create')
  @ApiBody({ type: CreateTowerReqDTO })
  @LockRequest({
    lockService: TowerController.nodeCache,
    method: `${TowerController.name}/create`,
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @User() user: UserEntity,
    @Body() payload: CreateTowerReqDTO,
  ): Promise<CreateTowerRespDTO> {
    return await this.towerService.create(
      user.id,
      payload.betAmount,
      payload.difficulty,
    );
  }

  @Post('cashout')
  @LockRequest({
    lockService: TowerController.nodeCache,
    method: `${TowerController.name}/cashout`,
  })
  @HttpCode(HttpStatus.OK)
  public async cashout(@User() user: UserEntity): Promise<ITower> {
    return await this.towerService.cashout(user.id);
  }

  @Post('openTile')
  @ApiBody({ type: OpenTileReqDTO })
  @LockRequest({
    lockService: TowerController.nodeCache,
    method: `${TowerController.name}/openTile`,
  })
  @HttpCode(HttpStatus.OK)
  public async openTile(
    @User() user: UserEntity,
    @Body() payload: OpenTileReqDTO,
  ): Promise<OpenTileResDTO> {
    return await this.towerService.openTile(
      user.id,
      payload.gameId,
      payload.tilePosition,
    );
  }

  @Get('game')
  @HttpCode(HttpStatus.OK)
  public async getGame(@User() user: UserEntity): Promise<Tower | null> {
    return this.towerService.getGame(user.id);
  }

  @Get('multipliers')
  @HttpCode(HttpStatus.OK)
  public async getMultipliers(
    @User() user: UserEntity,
  ): Promise<Record<string, number[]>> {
    return await this.towerService.getMultiplier(user.id);
  }
}
