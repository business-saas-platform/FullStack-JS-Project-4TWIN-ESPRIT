import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer, 
  OnGatewayConnection 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'], // Accepte les deux modes
})
export class SupportGateway {
  @WebSocketServer() server!: Server;

  @SubscribeMessage('chatToServer')
  handleMessage(@MessageBody() payload: any) {
    console.log('Message reçu:', payload);
    // On renvoie immédiatement le message au client pour l'afficher
    this.server.emit('chatToClient', payload); 
  }
}