import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'message' })
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @Column('int', { array: true, default: '{}' })
  likedBy: number[];

  @Column({ type: 'uuid', nullable: true })
  repliedTo?: string;

  @CreateDateColumn({ nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  @JoinColumn({ name: 'userId' }) // Specify the column name that will hold the foreign key
  user?: User;

  @Column()
  userId: number;
}
