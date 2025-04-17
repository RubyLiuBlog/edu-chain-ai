import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiAgentService } from './ai-agent.service';

@Module({
  providers: [AiService, AiAgentService],
  exports: [AiService],
})
export class AiModule {}
