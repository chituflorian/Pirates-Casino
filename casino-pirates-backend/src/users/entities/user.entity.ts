import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Status } from '../../statuses/entities/status.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { EntityHelper } from '../../utils/entity-helper';
import { Expose, Transform } from 'class-transformer';
import { GamesHistory } from '../../games-history/entities/games-history.entity';
import { Message } from '../../chat/entities/message.entity';
import { UserSettings } from '../../user-settings/entities/user-settings.entity';
import { v4 as uuidv4 } from 'uuid';
import { Wallet } from '../../blockchain/entities/wallet.entity';

@Entity()
export class User extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  bonus_balance: number;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @ManyToOne(() => FileEntity, {
    eager: true,
  })
  photo?: FileEntity | null;

  @ManyToOne(() => Role, {
    eager: true,
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column()
  roleId: number;

  @ManyToOne(() => Status, {
    eager: true,
  })
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column()
  @Index()
  statusId: number;

  @Column({ type: String, unique: true, nullable: true })
  referralCode: string | null;

  @ManyToOne(() => User, (user) => user.referrals, { nullable: true })
  @JoinColumn({ name: 'referredById' })
  referredBy: User | null;

  @Column({ nullable: true })
  referredById: number | null;

  @OneToMany(() => User, (user) => user.referredBy)
  referrals: User[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => GamesHistory, (gamesHistory) => gamesHistory.user)
  gameHistory: GamesHistory[];

  @Column({ default: 1 })
  level: number;

  @Expose({
    name: 'wallets',
    toClassOnly: true,
  })
  @Transform(
    ({ obj }) =>
      obj.settings.isAnonymous
        ? []
        : obj.wallets.find((wallet) => wallet.isPrimary === true),
    {
      toClassOnly: true,
    },
  )
  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  // @OneToMany(() => UserStats, (userStats) => userStats.user)
  // userStats: UserStats[];

  @OneToOne(() => UserSettings, (settings) => settings.user, { eager: true })
  settings: UserSettings;

  @BeforeInsert()
  generateReferralCode() {
    this.referralCode = uuidv4();
  }
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
