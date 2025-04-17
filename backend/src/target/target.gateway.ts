import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TargetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
    // Store client connection
    this.clients.set(client.id, client);

    // Listen for task subscription
    client.on('subscribe', (taskId: string) => {
      console.log(`Client ${client.id} subscribed to task ${taskId}`);
      client.join(`task:${taskId}`);
    });
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  notifyTargetProcessed(taskId: string, hash: string): void {
    this.server.to(`task:${taskId}`).emit('targetProcessed', {
      taskId,
      hash,
      status: 'completed',
    });
  }

  notifyTargetFailed(taskId: string, errorMessage: string): void {
    this.server.to(`task:${taskId}`).emit('targetFailed', {
      taskId,
      error: errorMessage,
      status: 'failed',
    });
  }
}
