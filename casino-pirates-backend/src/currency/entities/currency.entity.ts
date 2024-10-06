import { EntityHelper } from '../../utils/entity-helper';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChainCurrency } from './chain-currency.entity';

@Entity({ name: 'currencies' })
export class Currency extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cmcId: number;

  @Column('decimal', { precision: 18, scale: 9 })
  priceUsd: number;

  @Column('decimal', { precision: 18, scale: 9 })
  price: number;

  @Column()
  imageUrl: string;

  @Column()
  name: string;

  @OneToMany(() => ChainCurrency, (chainCurrency) => chainCurrency.currency)
  chainCurrencies: ChainCurrency[];
}
