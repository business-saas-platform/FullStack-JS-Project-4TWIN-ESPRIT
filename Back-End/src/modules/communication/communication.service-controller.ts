import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Import de tes entités
import { ChannelEntity } from './channel.entity';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../users/entities/user.entity';

const ADMIN_ROLES = ['platform_admin', 'business_owner', 'business_admin'];

// ==========================================================
// ─── SERVICE ─────────────────────────────────────────────
// ==========================================================

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channels: Repository<ChannelEntity>,
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  /**
   * Pour Mariem (Admin Plateforme) : Récupérer tous les tickets actifs
   */
  async getAllPlatformReclamations(role: string) {
    if (role !== 'platform_admin') {
      throw new ForbiddenException("Action réservée à l'administration.");
    }
    // On récupère tous les canaux nommés 'reclamation'
    return this.channels.find({
      where: { name: 'reclamation' },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer ou Créer le canal Support (utilisé par le ChatWidget)
   */
  async getOrCreateReclamationChannel(businessId: string, userId: string) {
    console.log(`[Service] Vérification du canal pour Business: ${businessId}`);

    let channel = await this.channels.findOne({ 
      where: { businessId, name: 'reclamation' } 
    });

    if (channel) {
      // Si le canal existe, on vérifie que l'utilisateur est bien membre
      if (!channel.memberIds.includes(userId)) {
        channel.memberIds = Array.from(new Set([...channel.memberIds, userId]));
        channel = await this.channels.save(channel);
      }
      return channel;
    }

    // Récupérer les admins du business (Mariem ou owner) pour les inclure
    const admins = await this.users.find({
      where: { businessId, role: In(['business_owner', 'business_admin']) },
    });

    const memberIds = Array.from(new Set([userId, ...admins.map((a) => a.id)]));

    const newChannel = this.channels.create({
      businessId,
      name: 'reclamation',
      description: 'Support technique direct',
      type: 'private',
      memberIds,
    });

    return this.channels.save(newChannel);
  }

  /**
   * Historique des messages (Important pour l'affichage au chargement)
   */
  async getMessages(channelId: string, limit = 50, before?: string) {
    const query = this.messages
      .createQueryBuilder('m')
      .where('m.channelId = :channelId', { channelId })
      .orderBy('m.createdAt', 'DESC')
      .take(limit);

    if (before) {
      query.andWhere('m.createdAt < :before', { before: new Date(before) });
    }

    const msgs = await query.getMany();
    // On inverse pour avoir l'ordre chronologique (ancien -> nouveau)
    return msgs.reverse();
  }

  async deleteChannel(businessId: string, channelId: string, role: string) {
    if (!ADMIN_ROLES.includes(role)) throw new ForbiddenException();
    
    const channel = await this.channels.findOne({ where: { id: channelId, businessId } });
    if (!channel) throw new NotFoundException('Canal introuvable');
    if (channel.isDefault) throw new ForbiddenException('Canal par défaut non supprimable');
    
    await this.channels.delete(channelId);
    return { ok: true };
  }
}

// ==========================================================
// ─── CONTROLLER ──────────────────────────────────────────
// ==========================================================

@Controller('communication')
export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  /**
   * Route pour Mariem (Dashboard Admin)
   * GET /communication/admin/reclamations
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/reclamations')
  async getAdminAll(@Req() req: any) {
    console.log(`[Admin] Mariem (${req.user.email}) récupère tous les tickets`);
    return this.service.getAllPlatformReclamations(req.user.role);
  }

  /**
   * Route pour le Client (ChatWidget)
   * POST /communication/reclamation
   */
  @UseGuards(JwtAuthGuard)
  @Post('reclamation')
  async getOrCreateReclamation(@Req() req: any) {
    console.log(`[Client] ${req.user.email} ouvre son chat support`);
    return this.service.getOrCreateReclamationChannel(
      req.user.businessId,
      req.user.sub
    );
  }

  /**
   * Charger les anciens messages
   * GET /communication/channels/:id/messages
   */
  @UseGuards(JwtAuthGuard)
  @Get('channels/:id/messages')
  async getMessages(
    @Param('id') channelId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.service.getMessages(channelId, limit ? parseInt(limit) : 50, before);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('channels/:id')
  async deleteChannel(@Req() req: any, @Param('id') channelId: string) {
    return this.service.deleteChannel(req.user.businessId, channelId, req.user.role);
  }
}