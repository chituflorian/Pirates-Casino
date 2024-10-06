import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GamesHistoryService } from './games-history.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { User, UserEntity } from '../users/users.decorator';
import { GamesHistory } from './entities/games-history.entity';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';
import { infinityPagination } from '../utils/infinity-pagination';

@Controller('games-history')
@ApiBearerAuth()
@Roles(RoleEnum.user)
@UseGuards(AuthGuard('jwt'))
@ApiTags('GamesHistory')
export class GamesHistoryController {
  constructor(private gamesHistoryService: GamesHistoryService) {}

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  public async getGameHistoryByUserId(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @User('userId') user: UserEntity,
  ): Promise<InfinityPaginationResultType<GamesHistory>> {
    return infinityPagination(
      await this.gamesHistoryService.getGameHistoryByUserId(user.id, {
        page,
        limit,
      }),
      { page, limit },
    );
  }
}
