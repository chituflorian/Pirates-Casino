import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ReferralService } from './referral.service'; // Ensure this import points to your service
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ReferralTrackDTO } from './dto/referral-track.dto';
import { User, UserEntity } from '../users/users.decorator';

@Controller('referrals')
@ApiBearerAuth()
@Roles(RoleEnum.user)
@UseGuards(AuthGuard('jwt'))
@ApiTags('Referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // Endpoint to track a new referral
  @Post('track')
  async trackReferral(@Body() referralTrackDTO: ReferralTrackDTO) {
    return this.referralService.trackReferral(
      referralTrackDTO.referrerId,
      referralTrackDTO.referredId,
    );
  }

  // Endpoint to get referral statistics for a user
  @Get('stats/:userId')
  async getReferralStatistics(@User() user: UserEntity) {
    return this.referralService.getReferralStatistics(user.id);
  }

  // Add other endpoints as necessary
}
