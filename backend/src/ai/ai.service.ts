import { Injectable } from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';

@Injectable()
export class AiService {
  constructor(private readonly aiAgentService: AiAgentService) {}

  async generateTargetPlan(goal: string, days: number): Promise<string> {
    console.log(`Generating target plan for goal: "${goal}" over ${days} days`);

    try {
      // This is a simulated delay to represent the AI processing time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Call the AI agent to generate the plan
      const hash = await this.aiAgentService.createPlan(goal, days);

      console.log(`Successfully generated plan with hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error generating target plan:', error);
      throw new Error(`Failed to generate target plan: ${error.message}`);
    }
  }
}
