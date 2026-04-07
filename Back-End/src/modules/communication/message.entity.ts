import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  businessId!: string; // tenant isolation

  @Index()
  @Column()
  channelId!: string; // "general", "accounting", or DM id

  @Column()
  senderId!: string;

  @Column()
  senderName!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: 'text' })
  type!: 'text' | 'file' | 'system';

  @Column({ nullable: true })
  fileUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
