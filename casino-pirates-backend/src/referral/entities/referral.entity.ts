import { User } from '../../users/entities/user.entity';
import { EntityHelper } from '../../utils/entity-helper';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'referral' })
export class Referral extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // Referrer - the user who made the referral
  @ManyToOne(() => User)
  referrer: User;

  // Referred - the user who was referred
  @ManyToOne(() => User)
  referred: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  //TODO
  //     // Initial deposit amount (if applicable)
  //   @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  //   initialDeposit: number | null;

  //   // Whether any rewards from this referral have been claimed
  //   @Column({ default: false })
  //   isClaimed: boolean;
}
