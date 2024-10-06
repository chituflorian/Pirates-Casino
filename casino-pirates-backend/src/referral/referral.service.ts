import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) {}

  // Track a new referral
  async trackReferral(
    referrerId: number,
    referredId: number,
    // initialDeposit?: number,
  ): Promise<Referral> {
    // Prevent self-referral
    if (referrerId === referredId) {
      throw new BadRequestException('Users cannot refer themselves');
    }
    // Check for existing referral
    const existingReferral = await this.referralRepository.findOne({
      where: { referred: { id: referredId } },
    });
    if (existingReferral) {
      throw new BadRequestException('This user has already been referred');
    }
    // Validate referrer and referred users
    const referrer = await this.userRepository.findOneBy({ id: referrerId });
    const referred = await this.userRepository.findOneBy({ id: referredId });

    if (!referrer || !referred) {
      throw new Error('Referrer or referred user not found');
    }

    const referral = new Referral();
    referral.referrer = referrer;
    referral.referred = referred;
    //TODO
    // referral.initialDeposit = initialDeposit || null;

    return this.referralRepository.save(referral);
  }

  //TODO
  //   // Method to calculate earnings from a referral (implement your logic here)
  //   async calculateEarningsFromReferral(referralId: number): Promise<number> {
  //     // Example logic, modify as per your business needs
  //     const referral = await this.referralRepository.findOne(referralId);
  //     if (!referral) {
  //       throw new Error('Referral not found');
  //     }
  //     // Example: Calculate earnings based on initial deposit
  //     return referral.initialDeposit ? referral.initialDeposit * 0.01 : 0; // 1% of initial deposit
  //   }

  //TODO
  //   // Claim rewards for a referral
  //   async claimRewards(referralId: number): Promise<void> {
  //     const referral = await this.referralRepository.findOne(referralId);
  //     if (!referral) {
  //       throw new Error('Referral not found');
  //     }
  //     if (referral.isClaimed) {
  //       throw new Error('Rewards for this referral have already been claimed');
  //     }

  //     referral.isClaimed = true;
  //     await this.referralRepository.save(referral);

  //     // Add logic to update user balance or perform other actions upon claiming rewards
  //   }

  // Get referral statistics for a user
  async getReferralStatistics(userId: number): Promise<any> {
    // Implement your logic to fetch and return referral statistics
    // Example: Count of referrals, total earnings from referrals, etc.
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Count the number of referrals made by this user
    const referralCount = await this.referralRepository.count({
      where: { referrer: { id: userId } },
    });

    // You can also calculate other statistics here if needed
    // For example, total earnings from referrals, number of claimed/unclaimed referrals, etc.

    return {
      userId: userId,
      referralCount: referralCount,
      // Include other statistics as needed
    };
  }
}
