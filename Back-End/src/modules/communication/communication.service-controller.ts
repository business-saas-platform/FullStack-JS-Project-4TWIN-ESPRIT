// ─── communication.service.ts ─────────────────────────────
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { MessageEntity } from './message.entity';

const ADMIN_ROLES = ['platform_admin', 'business_owner', 'business_admin'];

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channels: Repository<ChannelEntity>,
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
  ) {}

  // ── Get channels ─────────────────────────────────────────
  // Members only see public channels + private channels they belong to
  async getChannels(businessId: string, userId: string) {
    const all = await this.channels.find({
      where: { businessId },
      order: { createdAt: 'ASC' },
    });

    return all.filter(
      (ch) =>
        ch.type === 'public' ||
        ch.memberIds.includes(userId),
    );
  }

  // ── Create channel (admin only) ──────────────────────────
  async createChannel(
    businessId: string,
    userId: string,
    role: string,
    dto: {
      name: string;
      description?: string;
      type?: 'public' | 'private' | 'dm';
      memberIds?: string[]; // invited members for private channels
    },
  ) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new ForbiddenException(
        'Only admins and business owners can create channels.',
      );
    }

    // Always include the creator in memberIds
    const memberIds = Array.from(
      new Set([userId, ...(dto.memberIds ?? [])]),
    );

    const channel = this.channels.create({
      businessId,
      name: dto.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: dto.description,
      type: dto.type ?? 'public',
      memberIds: dto.type === 'public' ? [] : memberIds,
    });

    return this.channels.save(channel);
  }

  // ── Seed default channels ────────────────────────────────
  async seedDefaultChannels(businessId: string) {
    const defaults = ['general', 'announcements', 'random'];
    for (const name of defaults) {
      const exists = await this.channels.findOne({ where: { businessId, name } });
      if (!exists) {
        await this.channels.save(
          this.channels.create({
            businessId,
            name,
            type: 'public',
            isDefault: true,
            memberIds: [],
          }),
        );
      }
    }
  }

  // ── Get messages ─────────────────────────────────────────
  async getMessages(
    businessId: string,
    channelId: string,
    userId: string,
    limit = 50,
    before?: string,
  ) {
    const channel = await this.channels.findOne({
      where: { id: channelId, businessId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    // Check access for private channels
    if (channel.type !== 'public' && !channel.memberIds.includes(userId)) {
      throw new ForbiddenException('You are not a member of this channel.');
    }

    const query = this.messages
      .createQueryBuilder('m')
      .where('m.channelId = :channelId', { channelId })
      .andWhere('m.businessId = :businessId', { businessId })
      .orderBy('m.createdAt', 'DESC')
      .take(limit);

    if (before) {
      query.andWhere('m.createdAt < :before', { before: new Date(before) });
    }

    const msgs = await query.getMany();
    return msgs.reverse();
  }

  // ── Invite members to private channel (admin only) ───────
  async inviteMembers(
    businessId: string,
    channelId: string,
    adminRole: string,
    memberIds: string[],
  ) {
    if (!ADMIN_ROLES.includes(adminRole)) {
      throw new ForbiddenException('Only admins can invite members.');
    }

    const channel = await this.channels.findOne({
      where: { id: channelId, businessId },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    if (channel.type === 'public') {
      throw new ForbiddenException('Public channels are open to all.');
    }

    channel.memberIds = Array.from(
      new Set([...channel.memberIds, ...memberIds]),
    );
    return this.channels.save(channel);
  }

  // ── Remove member from private channel (admin only) ──────
  async removeMember(
    businessId: string,
    channelId: string,
    adminRole: string,
    memberId: string,
  ) {
    if (!ADMIN_ROLES.includes(adminRole)) {
      throw new ForbiddenException('Only admins can remove members.');
    }

    const channel = await this.channels.findOne({
      where: { id: channelId, businessId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    channel.memberIds = channel.memberIds.filter((id) => id !== memberId);
    return this.channels.save(channel);
  }

  // ── Delete channel (admin only) ──────────────────────────
  async deleteChannel(
    businessId: string,
    channelId: string,
    role: string,
  ) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new ForbiddenException('Only admins can delete channels.');
    }

    const channel = await this.channels.findOne({
      where: { id: channelId, businessId },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    if (channel.isDefault) {
      throw new ForbiddenException('Cannot delete default channels.');
    }

    await this.channels.delete(channelId);
    return { ok: true };
  }
}


// ─── communication.controller.ts ──────────────────────────
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  // GET /api/communication/channels
  @UseGuards(JwtAuthGuard)
  @Get('channels')
  getChannels(@Req() req: any) {
    return this.service.getChannels(req.user.businessId, req.user.sub);
  }

  // POST /api/communication/channels (admin only)
  @UseGuards(JwtAuthGuard)
  @Post('channels')
  createChannel(@Req() req: any, @Body() dto: any) {
    return this.service.createChannel(
      req.user.businessId,
      req.user.sub,
      req.user.role,
      dto,
    );
  }

  // POST /api/communication/channels/:id/invite (admin only)
  @UseGuards(JwtAuthGuard)
  @Post('channels/:id/invite')
  inviteMembers(
    @Req() req: any,
    @Param('id') channelId: string,
    @Body('memberIds') memberIds: string[],
  ) {
    return this.service.inviteMembers(
      req.user.businessId,
      channelId,
      req.user.role,
      memberIds,
    );
  }

  // DELETE /api/communication/channels/:id/members/:memberId
  @UseGuards(JwtAuthGuard)
  @Delete('channels/:id/members/:memberId')
  removeMember(
    @Req() req: any,
    @Param('id') channelId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.service.removeMember(
      req.user.businessId,
      channelId,
      req.user.role,
      memberId,
    );
  }

  // DELETE /api/communication/channels/:id (admin only)
  @UseGuards(JwtAuthGuard)
  @Delete('channels/:id')
  deleteChannel(@Req() req: any, @Param('id') channelId: string) {
    return this.service.deleteChannel(
      req.user.businessId,
      channelId,
      req.user.role,
    );
  }

  // GET /api/communication/channels/:id/messages
  @UseGuards(JwtAuthGuard)
  @Get('channels/:id/messages')
  getMessages(
    @Req() req: any,
    @Param('id') channelId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.service.getMessages(
      req.user.businessId,
      channelId,
      req.user.sub,
      limit ? parseInt(limit) : 50,
      before,
    );
  }
}
