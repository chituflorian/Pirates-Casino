import { User } from '../../users/entities/user.entity';
import { EntityHelper } from '../../utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tower' })
export class Tower extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  gameId: string;

  @Column({ type: 'jsonb', nullable: false })
  generatedMap: number[][];

  @Column({ type: 'jsonb', nullable: false })
  userMap: number[][];

  @Column({ type: 'jsonb', nullable: false })
  profitSteps: number[];

  @Column({ type: 'int', nullable: true })
  tilesOpened: number;

  @Column({ type: 'int', nullable: true })
  activeRow: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  initialBet: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  betAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  profit: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  multiplier: number;

  @Column({
    type: 'enum',
    enum: ['EASY', 'MEDIUM', 'HARD', 'EXTREME', 'NIGHTMARE'],
    default: 'EASY',
  })
  difficulty: string;

  @Column({
    type: 'enum',
    enum: ['IN_PROGRESS', 'LOST', 'CASHED_OUT', 'FINISHED'],
    default: 'IN_PROGRESS',
  })
  state: string;

  @CreateDateColumn({ nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { eager: true })
  user: User;
}
