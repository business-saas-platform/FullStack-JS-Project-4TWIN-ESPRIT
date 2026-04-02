import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany 
} from 'typeorm';
import { BusinessEntity } from '../../businesses/entities/business.entity';
// Assure-toi que le fichier sur ton disque est bien message.entity.ts (tout en minuscules)
import { MessageEntity } from './message.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('support_tickets')
export class SupportTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  subject!: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  @Column({ type: 'uuid' })
  businessId!: string;

  @ManyToOne(() => BusinessEntity)
  business!: BusinessEntity;

  // CORRECTION : On ajoute le type explicite (type) => MessageEntity 
  // pour que TypeScript résolve la dépendance circulaire.
  @OneToMany(() => MessageEntity, (message: MessageEntity) => message.ticket)
  messages!: MessageEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}