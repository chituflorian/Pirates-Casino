import { User } from '../../users/entities/user.entity';
import { EntityHelper } from '../../utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChainType } from './chain-type.entity';
@Entity({ name: 'wallet' })
export class Wallet extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChainType, (chain) => chain.wallets)
  @JoinColumn({ name: 'chainTypeId' })
  @Index()
  chainType: ChainType;

  @Column()
  chainTypeId: number;

  @Column()
  address: string;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  @Column()
  @Index()
  userId: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
