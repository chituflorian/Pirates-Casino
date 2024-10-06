import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Chain } from './chain.entity';
import { Wallet } from './wallet.entity';

@Entity()
export class ChainType extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Chain, (chain) => chain.chainType)
  chains: Chain[];

  @OneToMany(() => Wallet, (wallet) => wallet.chainType)
  wallets: Wallet[];
}
