import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal-dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { WrapResponse } from '../utils/decorators/wrap-response';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status-dto';

@ApiBearerAuth()
@Roles(RoleEnum.user)
@ApiTags('Withdrawal')
@UseGuards(AuthGuard('jwt'))
@Controller('withdrawal')
@WrapResponse()
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  async createWithdrawal(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalService.createWithdrawal(
      createWithdrawalDto.userId,
      createWithdrawalDto.amount,
      createWithdrawalDto.chainId,
      createWithdrawalDto.currencyId,
    );
  }

  @Patch(':id/status')
  async updateWithdrawalStatus(
    @Param('id') id: number,
    @Body() updateWithdrawalStatusDto: UpdateWithdrawalStatusDto,
  ) {
    return this.withdrawalService.updateWithdrawalStatus(
      id,
      updateWithdrawalStatusDto.newStatus,
    );
  }

  @Get()
  async getAllWithdrawals() {
    return this.withdrawalService.getAllWithdrawals();
  }
}
