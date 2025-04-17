import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { address: string; signature: string; message: string },
  ) {
    const { address, signature, message } = body;

    // Validate wallet signature
    const isValidSignature = await this.authService.validateSignature(
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
