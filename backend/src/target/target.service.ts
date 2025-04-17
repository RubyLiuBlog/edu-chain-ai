import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { AiService } from '../ai/ai.service';
import { TargetGateway } from './target.gateway';
import { BlockchainService } from '../blockchain/blockchain.service';

interface CreateTargetDto {
  goal: string;
  days: number;
  userAddress: string;
}

@Injectable()
export class TargetService {
  private processingTargets: Map<string, { status: string; hash?: string }> =
    new Map();

  constructor(
    @InjectQueue('target-processing') private targetQueue: Queue,
    private readonly aiService: AiService,
    private readonly targetGateway: TargetGateway,
    private readonly blockchainService: BlockchainService,
  ) {
    // Process completed AI processing
    this.targetQueue.on('completed', (job, result) => {
      const { taskId, hash } = result;
      const targetData = this.processingTargets.get(taskId);

      if (targetData) {
        // Update status and hash
        targetData.status = 'completed';
        targetData.hash = hash;
        this.processingTargets.set(taskId, targetData);

        // Notify client through WebSocket
        this.targetGateway.notifyTargetProcessed(taskId, hash);
      }
    });

    this.targetQueue.on('failed', (job, error) => {
      const { taskId } = job.data;
      const targetData = this.processingTargets.get(taskId);

      if (targetData) {
        targetData.status = 'failed';
        this.processingTargets.set(taskId, targetData);

        // Notify client through WebSocket about failure
        this.targetGateway.notifyTargetFailed(taskId, error.message);
      }
    });
  }

  async createTarget(
    createTargetDto: CreateTargetDto,
  ): Promise<{ taskId: string }> {
    const { goal, days, userAddress } = createTargetDto;

    // Generate unique task ID
    const taskId = uuidv4();

    // Store task in processing map
    this.processingTargets.set(taskId, { status: 'processing' });

    // Add job to queue
    await this.targetQueue.add(
      'process-target',
      {
        taskId,
        goal,
        days,
        userAddress,
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Process the target using AI Agent
    this.processTargetWithAI(taskId, goal, days);

    return { taskId };
  }

  async processTargetWithAI(
    taskId: string,
    goal: string,
    days: number,
  ): Promise<void> {
    try {
      // Start AI processing
      const hash = await this.aiService.generateTargetPlan(goal, days);

      // Update the processing target with the hash
      const targetData = this.processingTargets.get(taskId);
      if (targetData) {
        targetData.status = 'completed';
        targetData.hash = hash;
        this.processingTargets.set(taskId, targetData);
      }

      // Notify through websocket
      this.targetGateway.notifyTargetProcessed(taskId, hash);
    } catch (error) {
      console.error('Error processing target with AI:', error);

      // Update status to failed
      const targetData = this.processingTargets.get(taskId);
      if (targetData) {
        targetData.status = 'failed';
        this.processingTargets.set(taskId, targetData);
      }

      // Notify through websocket
      this.targetGateway.notifyTargetFailed(taskId, error.message as string);
    }
  }

  getTargetStatus(taskId: string): { status: string; hash?: string } {
    return this.processingTargets.get(taskId) || { status: 'not_found' };
  }

  async verifyContractCreation(hash: string, txHash: string): Promise<boolean> {
    // Verify that the target was created on-chain with the correct hash
    return await this.blockchainService.verifyTargetCreation(hash, txHash);
  }
}
