import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ScheduledJob } from '../utils/enums/scheduler.enum';
import { Logger } from '@nestjs/common';
import { BullQueue } from '../utils/enums/bull-queue.enum';
import { DepositService } from '../deposit/deposit.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ChainTypeEnum } from '../blockchain/chain-type.enum';
import { Chain } from '../blockchain/entities/chain.entity';
import { Queue } from 'bullmq';

@Processor(BullQueue.Cron)
export class SchedulerProcessor {
  private readonly logger = new Logger(SchedulerProcessor.name);

  constructor(
    @InjectQueue(BullQueue.Cron) private cronQueue: Queue,
    private readonly depositService: DepositService,
    private readonly blockchainService: BlockchainService,
  ) {
    this.initializeProcesses()
      .then(() => this.logger.log('initialized processes'))
      .catch((error) => {
        this.logger.error('error initializing processes', error);
      });
  }

  private async initializeProcesses() {
    const availableChains = await this.blockchainService.getAvailableChains([
      ChainTypeEnum.EVM,
    ]);
    for (const chain of availableChains) {
      await this.cronQueue.add(
        `${ScheduledJob.CheckEVMDeposit}`,
        { chainId: chain.id, chainSlug: chain.slug },
        { repeat: { every: 1 * 60 * 1000 } }, // runs every 5 minutes
      );
    }
  }

  // private async initializeProcesses() {
  //   const availableChains = await this.blockchainService.getAvailableChains([
  //     ChainTypeEnum.EVM,
  //   ]);
  //   for (const chain of availableChains) {
  //     await this.cronQueue.add(
  //       `${ScheduledJob.CheckEVMDeposit}-${chain.slug}`,
  //       { chainId: chain.id },
  //       { repeat: { every: 1 * 60 * 1000 } }, // runs every 5 minutes
  //     );
  //   }
  // }

  @Process({
    name: `${ScheduledJob.CheckEVMDeposit}-eth-sepolia`,
    concurrency: 1,
  })
  // @Process({
  //   name: `${ScheduledJob.CheckEVMDeposit}`,
  //   concurrency: 1,
  // })
  async handleEvmDeposit(job: Job<Chain>) {
    try {
      this.logger.log('started checking deposits for chain, jobId: ', job.id);
      await this.depositService.checkNewDepositsForChain(job.data.id);
    } catch (error) {
      this.logger.error('error checking deposits for chain', error);
    }
  }

  async handleStaleEvmDeposits(job: Job<Chain>) {
    try {
      this.logger.log(
        'started checking for stale deposits for chain, jobId: ',
        job.id,
      );
      await this.depositService.checkNewDepositsForChain(job.data.id);
    } catch (error) {
      this.logger.error('error checking deposits for chain', error);
    }
  }
}
