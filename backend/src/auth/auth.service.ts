import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class AuthService {
  private readonly redisClient: Redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly blockchainService: BlockchainService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', 'z123456'),
    });
  }

  validateSignature(
    address: string,
    signature: string,
    message: string,
  ): boolean {
    try {
      const recoveredAddress = this.blockchainService.recoverAddress(
        message,
        signature,
      );
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature validation error:', error);
      return false;
    }
  }

  async login(address: string): Promise<{ token: string; sessionId: string }> {
    // Generate a unique session ID for the user
    const sessionId = uuidv4();

    // Create a JWT token
    const payload = { sub: address, sessionId };
    const token = this.jwtService.sign(payload);

    // Store the session in Redis with 24 hours expiry
    await this.redisClient.set(
      `session:${sessionId}`,
      JSON.stringify({
        address,
        timestamp: Date.now(),
      }),
      'EX',
      86400,
    );

    return { token, sessionId };
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async validateSession(sessionId: string): Promise<unknown | null> {
    const sessionData = await this.redisClient.get(`session:${sessionId}`);
    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData);
  }

  async logout(sessionId: string): Promise<boolean> {
    const result = await this.redisClient.del(`session:${sessionId}`);
    return result === 1;
  }
}
