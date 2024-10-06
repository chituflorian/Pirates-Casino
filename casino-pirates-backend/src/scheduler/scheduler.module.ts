import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerProcessor } from './scheduler.processor';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { BullQueue } from '../utils/enums/bull-queue.enum';
import { Queue } from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { BullBoardModule } from '@bull-board/nestjs';
import { SchedulerAuthMiddleware } from './scheduler-auth.middleware';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DepositModule } from '../deposit/deposit.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BullQueue.Cron,
    }),
    BullBoardModule.forFeature({
      name: BullQueue.Cron,
      adapter: BullAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    BlockchainModule,
    DepositModule,
  ],
  controllers: [],
  providers: [SchedulerService, SchedulerProcessor],
  exports: [],
})
export class SchedulerModule {
  static register(): DynamicModule {
    const testQueue = BullModule.registerQueue({
      name: BullQueue.Cron,
    });

    if (!testQueue.providers || !testQueue.exports) {
      throw new Error('Unable to build queue');
    }

    return {
      module: SchedulerModule,
      imports: [
        BullModule.forRoot({
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        }),
        testQueue,
      ],
      providers: [SchedulerProcessor, ...testQueue.providers],
      exports: [...testQueue.exports],
    };
  }

  constructor(@InjectQueue(BullQueue.Cron) private readonly testQueue: Queue) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/api/queues');

    createBullBoard({
      queues: [new BullAdapter(this.testQueue)],
      serverAdapter,
    });

    consumer
      .apply(SchedulerAuthMiddleware, serverAdapter.getRouter())
      .forRoutes('/queues');
  }
}
