import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportController } from './support.controller'; // Vérifie le nom du fichier !
import { SupportGateway } from './support.gateway';
import { SupportTicketEntity } from './entities/support-ticket.entity';
import { MessageEntity } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicketEntity, MessageEntity])
  ],
  controllers: [SupportController],
  providers: [SupportService, SupportGateway],
  exports: [SupportService]
})
export class SupportModule {}