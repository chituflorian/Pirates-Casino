import { EntityHelper } from '../../utils/entity-helper';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GAME_TYPE {
  MINES = 0,
  TOWER = 1,
  GEMS = 2,
  CRASH = 3,
}

@Entity({ name: 'game-history' })
export class GamesHistory extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  gameId: string;

  @Column({
    type: 'enum',
    enum: GAME_TYPE,
  })
  game: GAME_TYPE;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  profit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.gameHistory)
  user: User;

  @Column()
  userId: number;
}
