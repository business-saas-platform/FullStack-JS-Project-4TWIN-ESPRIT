import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessageEntity } from './message.entity';
import { ChannelEntity } from './channel.entity';
import { CommunicationGateway } from './communication.gateway';
import { CommunicationService } from './communication.service-controller';
import { CommunicationController } from './communication.service-controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, ChannelEntity]),JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),],
  providers: [CommunicationGateway, CommunicationService],
  controllers: [CommunicationController],
  exports: [CommunicationService],
})
export class CommunicationModule {}
