import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicketEntity, TicketStatus } from './entities/support-ticket.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicketEntity)
    private readonly ticketRepo: Repository<SupportTicketEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  // --- LOGIQUE TICKETS ---

  async createTicket(businessId: string, subject: string) {
    const ticket = this.ticketRepo.create({
      businessId,
      subject: subject || 'Support Ticket',
      status: TicketStatus.OPEN,
    });
    return await this.ticketRepo.save(ticket);
  }

  async getBusinessTickets(businessId: string) {
    return await this.ticketRepo.find({
      where: { businessId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getAllTickets() {
    return await this.ticketRepo.find({
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }

  // --- LOGIQUE MESSAGES (CHAT) ---

  // J'ai renommé cette fonction pour correspondre exactement à l'appel de ton Controller
  async getMessagesByTicket(ticketId: string) {
    return await this.messageRepo.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }

  // Version robuste pour envoyer un message
  async createMessage(ticketId: string, senderId: string, content: string, isAdmin: boolean) {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket introuvable');

    const message = this.messageRepo.create({
      ticketId,
      senderId,
      content,
      isAdminMessage: isAdmin,
    });

    const savedMessage = await this.messageRepo.save(message);
    
    // On met à jour la date du ticket pour qu'il remonte en haut de liste (Tri par updatedAt)
    await this.ticketRepo.update(ticketId, { updatedAt: new Date() });
    
    return savedMessage;
  }
}