import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { User } from '../common/decorators/user.decorator';
import { TargetService } from './target.service';

@Controller('targets')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTarget(
    @Body() createTargetDto: { goal: string; days: number },
    @User() user: { address: string },
  ) {
    return this.targetService.createTarget({
      ...createTargetDto,
      userAddress: user.address,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':taskId/status')
  getTargetStatus(@Param('taskId') taskId: string) {
    return this.targetService.getTargetStatus(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyContractCreation(@Body() data: { hash: string; txHash: string }) {
    return {
      verified: await this.targetService.verifyContractCreation(
        data.hash,
        data.txHash,
      ),
    };
  }
}
