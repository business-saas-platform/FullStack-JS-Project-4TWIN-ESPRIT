import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { SupportTicketEntity } from './support-ticket.entity';

@Entity('support_messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Utilise ! pour dire à TS que TypeORM s'en occupe

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'uuid' })
  senderId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'senderId' }) // Optionnel mais recommandé pour la clarté
  sender!: UserEntity;

  @Column({ type: 'uuid' })
  ticketId!: string;

  // CORRECTION ICI : Ajout du type explicite (ticket: SupportTicketEntity) 
  // pour éviter l'erreur "unknown" due à la dépendance circulaire.
  @ManyToOne(() => SupportTicketEntity, (ticket: SupportTicketEntity) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticketId' })
  ticket!: SupportTicketEntity;

  @Column({ default: false })
  isAdminMessage!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}