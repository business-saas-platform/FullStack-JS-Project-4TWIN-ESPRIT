import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  async createTicket(@Req() req: any, @Body('subject') subject: string) {
    return await this.supportService.createTicket(req.user.businessId, subject);
  }

  @Get('my-tickets')
  async getMyTickets(@Req() req: any) {
    return await this.supportService.getBusinessTickets(req.user.businessId);
  }

  @Get('tickets/:id/messages')
  async getMessages(@Param('id') ticketId: string) {
    return await this.supportService.getMessagesByTicket(ticketId);
  }

  @Post('tickets/:id/messages')
  async sendMessage(
    @Param('id') ticketId: string,
    @Req() req: any,
    @Body('content') content: string,
  ) {
    const isAdmin = req.user.role === 'platform_admin';
    
    // Appel corrigé : 4 arguments envoyés séparément
    return await this.supportService.createMessage(
      ticketId, 
      req.user.userId || req.user.id, 
      content, 
      isAdmin
    );
  }

  @Get('admin/all-tickets')
  async getAllTickets() {
    return await this.supportService.getAllTickets();
  }
}