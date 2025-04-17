import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  getNonce() {
    // 生成随机数作为nonce
    const nonce = randomBytes(32).toString('hex');
    // 可以将nonce与地址关联存储，以便后续验证
    // 这里简单返回nonce
    return { code: 200, data: nonce, success: true };
  }

  @Post('login')
  async login(
    @Body() body: { address: string; signature: string; message: string },
  ) {
    const { address, signature, message } = body;

    // Validate wallet signature
    const isValidSignature = this.authService.validateSignature(
      address,
      signature,
      message,
    );
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Generate token and create session
    return this.authService.login(address);
  }

  @Post('logout')
  async logout(@Body() body: { sessionId: string }) {
    const { sessionId } = body;
    return { success: await this.authService.logout(sessionId) };
  }
}
