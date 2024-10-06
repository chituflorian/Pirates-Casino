import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MinesService } from './mines.service';
import { User, UserEntity } from '../users/users.decorator';
import { MinesCreateDTO } from './dto/MinesDTO';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { OpenTileDTO } from './dto/OpenTileDTO';
import { CreateMinesRespDTO } from './dto/CreateMinesRespDTO';
import { CashoutMinesRespDTO } from './dto/CashoutMinesDTO';
import { OpenTileResDTO } from './dto/OpenTileResDTO';
import NodeCache from 'node-cache';
import { LockRequest } from '../utils/decorators/lock-request';
import { WrapResponse } from '../utils/decorators/wrap-response';
import IMines from './interface/IMines.interface';

@Controller('mines')
@ApiBearerAuth()
@Roles(RoleEnum.user)
@UseGuards(AuthGuard('jwt'))
@ApiTags('Mines')
@WrapResponse()
export class MinesController {
  private static readonly nodeCache = new NodeCache({
    deleteOnExpire: true,
    stdTTL: 30,
  });
  constructor(private minesService: MinesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: MinesCreateDTO })
  @LockRequest({
    lockService: MinesController.nodeCache,
    method: `${MinesController.name}/create`,
  })
  public async create(
    @User() user: UserEntity,
    @Body() payload: MinesCreateDTO,
  ): Promise<CreateMinesRespDTO> {
    return this.minesService.create(user.id, payload.mines, payload.amount);
  }

  @Post('cashout')
  @LockRequest({
    lockService: MinesController.nodeCache,
    method: `${MinesController.name}/cashout`,
  })
  @HttpCode(HttpStatus.OK)
  public async cashout(@User() user: UserEntity): Promise<CashoutMinesRespDTO> {
    return this.minesService.cashout(user.id);
  }

  @Post('tile')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: OpenTileDTO })
  @LockRequest({
    lockService: MinesController.nodeCache,
    method: `${MinesController.name}/openTile`,
  })
  public async openTile(
    @User() user: UserEntity,
    @Body() payload: OpenTileDTO,
  ): Promise<OpenTileResDTO> {
    return this.minesService.openTile(
      user.id,
      payload.gameId,
      payload.x,
      payload.y,
    );
  }

  @Get('game')
  @HttpCode(HttpStatus.OK)
  public async getGame(@User() user: UserEntity): Promise<IMines> {
    return await this.minesService.getGame(user.id);
  }
  // @Get('stats/all'))
  // public async getAllStats() {
  //   return this.minesService.getAllGames();
  // }

  // @Get('stats/lucky')
  // public async getLuckyWins() {
  //   return this.minesService.getLuckyWins();
  // }

  // @Get('stats/my')
  // public async getUserStats(@User() user: UserEntity): Promise<Mines[]> {
  //   return this.minesService.getUserStats(user.id);
  // }
}
