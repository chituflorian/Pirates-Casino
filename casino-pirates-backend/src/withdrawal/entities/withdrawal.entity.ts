import { Chain } from '../../blockchain/entities/chain.entity';
import { ChainCurrency } from '../../currency/entities/chain-currency.entity';
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { WithdrawalStatusType } from '../status-type.enum';

@Entity()
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'decimal' })
  amount: number;

  @ManyToOne(() => Chain, (chain) => chain.id)
  chain: Chain;

  @ManyToOne(() => ChainCurrency, (chainCurrency) => chainCurrency.id)
  currency: ChainCurrency;

  @Column({ type: 'varchar', length: 45 })
  status: WithdrawalStatusType;

  @Column({ type: 'boolean', default: false })
  verifiedByCronJob: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}
