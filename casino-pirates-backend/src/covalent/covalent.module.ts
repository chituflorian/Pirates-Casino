import { Module } from '@nestjs/common';
import { CovalentService } from './covalent.service';

@Module({
  imports: [],
  providers: [CovalentService],
  exports: [CovalentService],
})
export class CovalentModule {}
