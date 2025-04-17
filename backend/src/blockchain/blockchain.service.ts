import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import targetContractAbi from 'src/common/abi/targetContractAbi';

@Injectable()
export class BlockchainService {
  private provider: ethers.Provider;
  private targetContractAbi: any[];

  constructor(private readonly configService: ConfigService) {
    // Initialize ethers provider
    const rpcUrl = this.configService.get<string>(
      'ETH_RPC_URL',
      'http://localhost:8545',
    );
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.targetContractAbi = [...targetContractAbi];
  }

  recoverAddress(message: string, signature: string): string {
    try {
      // Recover the address from the signature
      const messageHash = ethers.hashMessage(message);
      const messageHashBytes = ethers.getBytes(messageHash);
      const recoveredAddress = ethers.recoverAddress(
        messageHashBytes,
        signature,
      );
      return recoveredAddress;
    } catch (error) {
      console.error('Error recovering address:', error);
      throw new Error('Failed to recover address from signature');
    }
  }

  async verifyTargetCreation(hash: string, txHash: string): Promise<boolean> {
    try {
      // Get transaction receipt
      const txReceipt = await this.provider.getTransactionReceipt(txHash);
      if (!txReceipt || !txReceipt.status) {
        return false;
      }
      // Get transaction
      const tx = await this.provider.getTransaction(txHash);

      // Check if transaction exists
      if (!tx) {
        return false;
      }

      // Parse the transaction data to check if it's a call to createTarget with the correct hash
      const iface = new ethers.Interface(this.targetContractAbi);
      try {
        const decodedData = iface.parseTransaction({ data: tx.data });

        if (
          decodedData &&
          decodedData.name === 'createTarget' &&
          decodedData.args[0] === hash
        ) {
          return true;
        }
      } catch (e) {
        console.error('Error decoding transaction data:', e);
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error verifying target creation:', error);
      return false;
    }
  }
}
