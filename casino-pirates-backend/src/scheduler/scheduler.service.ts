import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BullQueue } from '../utils/enums/bull-queue.enum';
import { ScheduledJob } from '../utils/enums/scheduler.enum';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ChainTypeEnum } from '../blockchain/chain-type.enum';
import { Chain } from '../blockchain/entities/chain.entity';
@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue(BullQueue.Cron) private cronJobQueue: Queue,
    private readonly blockchainService: BlockchainService,
  ) {}

  async onModuleInit() {
    const availableChains = await this.blockchainService.getAvailableChains([
      ChainTypeEnum.EVM,
    ]);
    for (const chain of availableChains) {
      await this.scheduleJob({
        queue: this.cronJobQueue,
        jobName: `${ScheduledJob.CheckEVMDeposit}-${chain.slug}`,
        cron: chain.cronCheckDeposit,
        data: chain,
      });
    }
  }

  private async scheduleJob(options: {
    queue: Queue;
    jobName: string;
    cron: string;
    data: Chain;
  }) {
    //test if the used cron is valid
    const regex = /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/;
    if (!regex.test(options.cron)) {
      throw new Error('invalid cron provided');
    }
    //remove old instances
    const allRepeatableJobs = await options.queue.getRepeatableJobs();
    const oldJob = allRepeatableJobs
      .filter((job) => job.name === options.jobName)
      .shift();
    if (!!oldJob) {
      await options.queue.removeRepeatableByKey(oldJob.key);
    }
    //add the new instance of the job to redis
    await options.queue.add(options.jobName, options.data, {
      repeat: {
        cron: options.cron,
      },
    });
  }
}
