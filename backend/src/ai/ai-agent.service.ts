import { Injectable } from '@nestjs/common';
import { startGenerateCourse } from '../common/agent/CourseGenAgent';

@Injectable()
export class AiAgentService {
  async createPlan(goal: string, days: number): Promise<string> {
    try {
      // This is a mock implementation of AI Agent
      console.log(`AI Agent creating plan for: ${goal} (${days} days)`);

      // In a real implementation, this would call an external AI service
      // For now, we'll simulate the AI processing

      // Create a sample plan structure

      const hash = await startGenerateCourse(goal, days);
      if (!hash) {
        throw new Error('Failed to generate course outline');
      }
      return hash;
    } catch (error) {
      console.error('AI Agent Error:', error);
      throw new Error(`AI Agent failed: ${error.message}`);
    }
  }
}
