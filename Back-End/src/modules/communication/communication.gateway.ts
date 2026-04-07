import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MessageEntity } from './message.entity';
import { ChannelEntity } from './channel.entity';
@WebSocketGateway({
  namespace: 'communication', // <--- DOIT CORRESPONDRE AU io(`${URL}/communication`)
  cors: { origin: '*' }
})
export class CommunicationGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    @InjectRepository(MessageEntity) private readonly messages: Repository<MessageEntity>,
    @InjectRepository(ChannelEntity) private readonly channels: Repository<ChannelEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: any) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) return client.disconnect();
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.businessId = payload.businessId;
      client.role = payload.role;
    } catch {
      client.disconnect();
    }
  }

  // --- REJOINDRE LE CANAL (Crucial pour l'Admin) ---
  @SubscribeMessage('join_channel')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string }) {
    // L'admin rejoint la room spécifique du ticket
    client.join(`channel:${data.channelId}`);
    console.log(`User ${client.id} joined channel ${data.channelId}`);
  }

  // --- ENVOYER / RECEVOIR MESSAGE ---
  @SubscribeMessage('send_message')
  async handleMessage(@ConnectedSocket() client: any, @MessageBody() data: any) {
    // 1. Sauvegarder en base de données
    const newMessage = await this.messages.save(
      this.messages.create({
        channelId: data.channelId,
        businessId: data.businessId,
        senderId: client.userId,
        senderName: data.senderName || 'Utilisateur',
        content: data.content,
        type: 'text',
      }),
    );

    // 2. Diffuser à TOUS ceux qui sont dans la room 'channel:ID'
    // Cela inclut l'admin s'il a fait 'join_channel'
    this.server.to(`channel:${data.channelId}`).emit('new_message', newMessage);
  }
}