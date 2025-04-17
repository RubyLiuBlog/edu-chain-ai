import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';
import { TargetGateway } from './target.gateway';
import { AiModule } from '../ai/ai.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { TargetProcessor } from './target.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'target-processing',
    }),
    AiModule,
    BlockchainModule,
  ],
  controllers: [TargetController],
  providers: [TargetService, TargetGateway, TargetProcessor],
  exports: [TargetService],
})
export class TargetModule {}
