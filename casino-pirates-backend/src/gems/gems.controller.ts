import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { GemsService } from './gems.service';
import { GemsReqDTO } from './dto/GemsReqDTO';
import { User, UserEntity } from '../users/users.decorator';
import { GemsResDTO } from './dto/GemsResDTO';
import { LockRequest } from '../utils/decorators/lock-request';
import NodeCache from 'node-cache';

@Controller('gems')
@ApiBearerAuth()
@Roles(RoleEnum.user)
@UseGuards(AuthGuard('jwt'))
@ApiTags('Gems')
export class GemsController {
  private static readonly nodeCache = new NodeCache({
    deleteOnExpire: true,
    stdTTL: 30,
  });
  constructor(private gemsService: GemsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: GemsReqDTO })
  @LockRequest({
    lockService: GemsController.nodeCache,
    method: `${GemsController.name}/create`,
  })
  public async create(
    @User() user: UserEntity,
    @Body() payload: GemsReqDTO,
  ): Promise<GemsResDTO> {
    return this.gemsService.create(user.id, payload.difficulty, payload.amount);
  }

  @Get('game')
  @HttpCode(HttpStatus.OK)
  public async getGame(@User() user: UserEntity) {
    return await this.gemsService.getGame(user.id);
  }

  @Get('multipliers')
  @HttpCode(HttpStatus.OK)
  public async getMultipliers(@User() user: UserEntity) {
    return await this.gemsService.getMultiplier(user.id);
  }
}
