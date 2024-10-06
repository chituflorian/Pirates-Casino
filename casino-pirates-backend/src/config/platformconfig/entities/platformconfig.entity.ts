import { EntityHelper } from '../../../utils/entity-helper';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export type OptionType = 'string' | 'number' | 'boolean';

@Entity({ name: 'config' })
export class Config extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  option_key: string;

  @Column({ type: 'text', nullable: true })
  option_value: string;

  @Column({
    type: 'enum',
    enum: ['string', 'number', 'boolean'],
    nullable: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  option_type: OptionType;
}
