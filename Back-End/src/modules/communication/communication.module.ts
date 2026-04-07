import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <--- AJOUTE CET IMPORT
import { CommunicationService, CommunicationController } from './communication.service-controller';
import { CommunicationGateway } from './communication.gateway';
import { ChannelEntity } from './channel.entity';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity, MessageEntity, UserEntity]),
    // --- AJOUTE CECI ---
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Utilise la même config que ton AuthModule
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationGateway],
  exports: [CommunicationService],
})
export class CommunicationModule {}