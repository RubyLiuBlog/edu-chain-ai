import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { AiService } from '../ai/ai.service';

@Processor('target-processing')
export class TargetProcessor {
  constructor(private readonly aiService: AiService) {}

  @Process('process-target')
  async processTarget(
    job: Job<{
      taskId: string;
      goal: string;
      days: number;
      userAddress: string;
    }>,
  ) {
    const { taskId, goal, days } = job.data;

    try {
      console.log(`Processing target task ${taskId} for goal: ${goal}`);

      // Call AI service to generate the target plan
      const hash = await this.aiService.generateTargetPlan(goal, days);

      return { taskId, hash };
    } catch (error) {
      console.error(`Error processing target ${taskId}:`, error);
      throw error;
    }
  }
}
