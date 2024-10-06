import { EntityHelper } from '../../utils/entity-helper';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ChainCurrency } from '../../currency/entities/chain-currency.entity';
import { Chain } from './chain.entity';

@Entity({ name: 'transactions' })
@Unique(['hash', 'chainId'])
export class Transaction extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChainCurrency, (chainCurrency) => chainCurrency.id)
  @JoinColumn({ name: 'currencyId' })
  chainCurrency: ChainCurrency;

  @ManyToOne(() => Chain, (chain) => chain.id)
  @JoinColumn({ name: 'chainId' })
  chain: Chain;

  @Column()
  chainId: number;

  @Column()
  currencyId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column()
  status: string;

  @Column()
  hash: string;

  @Column('decimal', {
    precision: 18,
    scale: 9,
  })
  usdValue: number;

  @Column({
    type: 'bigint',
  })
  blockNumber: number;

  @Column('decimal', {
    precision: 18,
    scale: 9,
  })
  amount: number;

  @Column()
  blockTimestamp: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
