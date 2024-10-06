import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Crash } from './crash.entity';
import { User } from '../../users/entities/user.entity';
import { EntityHelper } from '../../utils/entity-helper';
import { BET_STATE } from '../enums/state';

@Entity('crash-bet')
export class CrashBet extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  betId: string;

  @Column('decimal', { precision: 8, scale: 2, nullable: true, default: null })
  multiplier: number | null;

  @Column('decimal', { precision: 18, scale: 9 })
  amount: number;

  @Column('decimal', { precision: 18, scale: 9 })
  initialBet: number;

  @Column('decimal', { precision: 18, scale: 9 })
  winAmount: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true, default: 0 })
  autoCashOut: number | null;

  @Column('enum', { enum: BET_STATE })
  state: BET_STATE;

  @CreateDateColumn({ nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Crash)
  @JoinColumn({ name: 'gameId' })
  crash: Crash;

  //   @ManyToOne(() => Currency)
  //   currency: Currency;

  @ManyToOne(() => User, { eager: true })
  user: User;
}
