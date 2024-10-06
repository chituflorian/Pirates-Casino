// src/chains/entities/chain.entity.ts

import { EntityHelper } from '../../utils/entity-helper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChainType } from './chain-type.entity';
import { ChainCurrency } from '../../currency/entities/chain-currency.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'chains' })
export class Chain extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChainType, (chainType) => chainType.chains)
  @JoinColumn({ name: 'chainTypeId' })
  chainType: ChainType;

  @Column()
  chainTypeId: number;

  @OneToMany(() => Transaction, (transaction) => transaction.chain)
  transactions: Transaction[];

  @Column()
  depositAddress: string;

  @Column()
  slug: string;

  @Column()
  cronCheckDeposit: string;

  @Column()
  rpc_url: string;

  @OneToMany(() => ChainCurrency, (chainCurrency) => chainCurrency.chain)
  chainCurrencies: ChainCurrency[];

  @Column({
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @Column({
    default: 'now()',
    nullable: true,
  })
  lastChecked: Date;
}
