import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MessageEntity } from './message.entity';
import { ChannelEntity } from './channel.entity';

interface AuthSocket extends Socket {
  userId: string;
  userName: string;
  businessId: string;
  role: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/communication',
})
export class CommunicationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  // Track online users per business: businessId -> Set of userIds
  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
    @InjectRepository(ChannelEntity)
    private readonly channels: Repository<ChannelEntity>,
    private readonly jwtService: JwtService,
  ) {}

  // ─── CONNECTION ───────────────────────────────────────
  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) { client.disconnect(); return; }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userName = payload.name || payload.email;
      client.businessId = payload.businessId;
      client.role = payload.role;

      // Join business room (tenant isolation)
      client.join(`business:${client.businessId}`);

      // Track online
      if (!this.onlineUsers.has(client.businessId)) {
        this.onlineUsers.set(client.businessId, new Set());
      }
      this.onlineUsers.get(client.businessId)!.add(client.userId);

      // Notify others in same business
      this.server.to(`business:${client.businessId}`).emit('user:online', {
        userId: client.userId,
        userName: client.userName,
      });

      // Send current online users to this client
      client.emit('online:list', Array.from(this.onlineUsers.get(client.businessId) ?? []));

    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (!client.businessId) return;

    this.onlineUsers.get(client.businessId)?.delete(client.userId);

    this.server.to(`business:${client.businessId}`).emit('user:offline', {
      userId: client.userId,
    });
  }

  // ─── JOIN CHANNEL ─────────────────────────────────────
  @SubscribeMessage('channel:join')
  async handleJoinChannel(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { channelId: string },
  ) {
    const channel = await this.channels.findOne({
      where: { id: data.channelId, businessId: client.businessId },
    });
    if (!channel) return;

    client.join(`channel:${data.channelId}`);

    // Send last 50 messages
    const history = await this.messages.find({
      where: { channelId: data.channelId, businessId: client.businessId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    client.emit('channel:history', history.reverse());
  }

  // ─── SEND MESSAGE ─────────────────────────────────────
  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { channelId: string; content: string; type?: string },
  ) {
    // Verify channel belongs to this business (tenant check)
    const channel = await this.channels.findOne({
      where: { id: data.channelId, businessId: client.businessId },
    });
    if (!channel) return;

    const message = await this.messages.save(
      this.messages.create({
        businessId: client.businessId,
        channelId: data.channelId,
        senderId: client.userId,
        senderName: client.userName,
        content: data.content,
        type: (data.type as any) || 'text',
      }),
    );

    // Broadcast to everyone in the channel
    this.server.to(`channel:${data.channelId}`).emit('message:new', message);
  }

  // ─── TYPING INDICATOR ────────────────────────────────
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:start', {
      userId: client.userId,
      userName: client.userName,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:stop', {
      userId: client.userId,
    });
  }

  // ─── WebRTC SIGNALING ────────────────────────────────
  // Call invite
  @SubscribeMessage('call:invite')
  handleCallInvite(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { channelId: string; callId: string; type: 'video' | 'audio' },
  ) {
    // Only broadcast within same business
    client.to(`business:${client.businessId}`).emit('call:invite', {
      callId: data.callId,
      channelId: data.channelId,
      callerId: client.userId,
      callerName: client.userName,
      type: data.type,
    });
  }

  // WebRTC offer
  @SubscribeMessage('webrtc:offer')
  handleOffer(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { targetId: string; callId: string; offer: RTCSessionDescriptionInit },
  ) {
    this.server.to(`user:${data.targetId}`).emit('webrtc:offer', {
      callId: data.callId,
      from: client.userId,
      fromName: client.userName,
      offer: data.offer,
    });
  }

  // WebRTC answer
  @SubscribeMessage('webrtc:answer')
  handleAnswer(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { targetId: string; callId: string; answer: RTCSessionDescriptionInit },
  ) {
    this.server.to(`user:${data.targetId}`).emit('webrtc:answer', {
      callId: data.callId,
      from: client.userId,
      answer: data.answer,
    });
  }

  // ICE candidates
  @SubscribeMessage('webrtc:ice')
  handleIce(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { targetId: string; callId: string; candidate: RTCIceCandidateInit },
  ) {
    this.server.to(`user:${data.targetId}`).emit('webrtc:ice', {
      callId: data.callId,
      from: client.userId,
      candidate: data.candidate,
    });
  }

  // Join call room
  @SubscribeMessage('call:join')
  handleCallJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { callId: string },
  ) {
    client.join(`call:${data.callId}`);
    // Register personal room for direct signaling
    client.join(`user:${client.userId}`);

    client.to(`call:${data.callId}`).emit('call:peer-joined', {
      userId: client.userId,
      userName: client.userName,
    });
  }

  // Leave call
  @SubscribeMessage('call:leave')
  handleCallLeave(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { callId: string },
  ) {
    client.leave(`call:${data.callId}`);
    this.server.to(`call:${data.callId}`).emit('call:peer-left', {
      userId: client.userId,
    });
  }

  // Screen share toggle
  @SubscribeMessage('screen:share')
  handleScreenShare(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { callId: string; sharing: boolean },
  ) {
    client.to(`call:${data.callId}`).emit('screen:share', {
      userId: client.userId,
      sharing: data.sharing,
    });
  }
}
