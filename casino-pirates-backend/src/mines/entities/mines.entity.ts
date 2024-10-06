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
import IMines from '../interface/IMines.interface';

@Entity({ name: 'mines' })
export class Mines extends EntityHelper implements IMines {
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

  @Column({ type: 'int' })
  mines: number;

  @Column({ type: 'int' })
  tilesOpened: number;

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
    enum: ['IN_PROGRESS', 'LOST', 'CASHED_OUT', 'FINISHED'],
    default: 'IN_PROGRESS',
  })
  state: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, { eager: true })
  user: User;
}
