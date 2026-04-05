"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const message_entity_1 = require("./message.entity");
const channel_entity_1 = require("./channel.entity");
let CommunicationGateway = class CommunicationGateway {
    constructor(messages, channels, jwtService) {
        this.messages = messages;
        this.channels = channels;
        this.jwtService = jwtService;
        this.onlineUsers = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.userId = payload.sub;
            client.userName = payload.name || payload.email;
            client.businessId = payload.businessId;
            client.role = payload.role;
            client.join(`business:${client.businessId}`);
            if (!this.onlineUsers.has(client.businessId)) {
                this.onlineUsers.set(client.businessId, new Set());
            }
            this.onlineUsers.get(client.businessId).add(client.userId);
            this.server.to(`business:${client.businessId}`).emit('user:online', {
                userId: client.userId,
                userName: client.userName,
            });
            client.emit('online:list', Array.from(this.onlineUsers.get(client.businessId) ?? []));
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (!client.businessId)
            return;
        this.onlineUsers.get(client.businessId)?.delete(client.userId);
        this.server.to(`business:${client.businessId}`).emit('user:offline', {
            userId: client.userId,
        });
    }
    async handleJoinChannel(client, data) {
        const channel = await this.channels.findOne({
            where: { id: data.channelId, businessId: client.businessId },
        });
        if (!channel)
            return;
        client.join(`channel:${data.channelId}`);
        const history = await this.messages.find({
            where: { channelId: data.channelId, businessId: client.businessId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        client.emit('channel:history', history.reverse());
    }
    async handleMessage(client, data) {
        const channel = await this.channels.findOne({
            where: { id: data.channelId, businessId: client.businessId },
        });
        if (!channel)
            return;
        const message = await this.messages.save(this.messages.create({
            businessId: client.businessId,
            channelId: data.channelId,
            senderId: client.userId,
            senderName: client.userName,
            content: data.content,
            type: data.type || 'text',
        }));
        this.server.to(`channel:${data.channelId}`).emit('message:new', message);
    }
    handleTypingStart(client, data) {
        client.to(`channel:${data.channelId}`).emit('typing:start', {
            userId: client.userId,
            userName: client.userName,
        });
    }
    handleTypingStop(client, data) {
        client.to(`channel:${data.channelId}`).emit('typing:stop', {
            userId: client.userId,
        });
    }
    handleCallInvite(client, data) {
        client.to(`business:${client.businessId}`).emit('call:invite', {
            callId: data.callId,
            channelId: data.channelId,
            callerId: client.userId,
            callerName: client.userName,
            type: data.type,
        });
    }
    handleOffer(client, data) {
        this.server.to(`user:${data.targetId}`).emit('webrtc:offer', {
            callId: data.callId,
            from: client.userId,
            fromName: client.userName,
            offer: data.offer,
        });
    }
    handleAnswer(client, data) {
        this.server.to(`user:${data.targetId}`).emit('webrtc:answer', {
            callId: data.callId,
            from: client.userId,
            answer: data.answer,
        });
    }
    handleIce(client, data) {
        this.server.to(`user:${data.targetId}`).emit('webrtc:ice', {
            callId: data.callId,
            from: client.userId,
            candidate: data.candidate,
        });
    }
    handleCallJoin(client, data) {
        client.join(`call:${data.callId}`);
        client.join(`user:${client.userId}`);
        client.to(`call:${data.callId}`).emit('call:peer-joined', {
            userId: client.userId,
            userName: client.userName,
        });
    }
    handleCallLeave(client, data) {
        client.leave(`call:${data.callId}`);
        this.server.to(`call:${data.callId}`).emit('call:peer-left', {
            userId: client.userId,
        });
    }
    handleScreenShare(client, data) {
        client.to(`call:${data.callId}`).emit('screen:share', {
            userId: client.userId,
            sharing: data.sharing,
        });
    }
};
exports.CommunicationGateway = CommunicationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CommunicationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('channel:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:invite'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleCallInvite", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc:offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc:answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc:ice'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleIce", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleCallJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleCallLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('screen:share'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleScreenShare", null);
exports.CommunicationGateway = CommunicationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', credentials: true },
        namespace: '/communication',
    }),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(channel_entity_1.ChannelEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], CommunicationGateway);
//# sourceMappingURL=communication.gateway.js.map