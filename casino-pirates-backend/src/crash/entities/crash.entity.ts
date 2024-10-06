import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CrashBet } from './crash-bet.entity'; // Assuming you'll convert crash-bet.model to crash-bet.entity with TypeORM
import { EntityHelper } from '../../utils/entity-helper';
import { GAME_STATE } from '../enums/state';

@Entity({ name: 'crash' })
export class Crash extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: string;

  @Column()
  round_hash: string;

  @Column()
  round_salt: string;

  @Column('decimal', { precision: 16, scale: 16 })
  round_random: number;

  @Column('decimal', { precision: 8, scale: 2 })
  round_number: number;

  @Column('decimal', { precision: 18, scale: 9 })
  win_sum: number;

  @Column('decimal', { precision: 18, scale: 9 })
  bet_sum: number;

  @Column('enum', { enum: GAME_STATE })
  state: GAME_STATE;

  @OneToMany(() => CrashBet, (crashBet) => crashBet.crash)
  bets: CrashBet[];
}
