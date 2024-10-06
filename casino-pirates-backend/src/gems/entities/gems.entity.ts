import { EntityHelper } from '../../utils/entity-helper';
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'gems' })
export class Gems extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  generatedGems: string;

  @Column({ type: 'int' })
  prize: number;

  @Column({ default: 0, type: 'decimal', precision: 18, scale: 9 })
  initialBet: number;

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  betAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  profit: number;

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  multiplier: number;

  @Column({
    type: 'enum',
    enum: ['WIN', 'LOSE'],
    default: 'LOSE',
  })
  state: string;

  @Column({
    type: 'enum',
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'EASY',
  })
  difficulty: string;

  @CreateDateColumn({ nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { eager: true })
  user: User;
}
