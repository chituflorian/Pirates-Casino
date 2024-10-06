import { EntityHelper } from '../../utils/entity-helper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Chain } from '../../blockchain/entities/chain.entity';
import { Currency } from './currency.entity';

@Entity({ name: 'chain_currencies' })
@Unique(['chainId', 'currencyId', 'address'])
export class ChainCurrency extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chain, (chain) => chain.id)
  @JoinColumn({ name: 'chainId' })
  chain: Chain;

  @Column()
  chainId: number;

  @ManyToOne(() => Currency, (currency) => currency.id)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @Column()
  address: string;

  @Column()
  currencyId: number;
}
