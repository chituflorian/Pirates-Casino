import { User } from '../../users/entities/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  hideStats: boolean;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ default: true })
  soundEffects: boolean;

  @Column({ default: true })
  notifications: boolean;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  userId: number;
}
