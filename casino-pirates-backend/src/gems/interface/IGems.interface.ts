import { User } from '../../users/entities/user.entity';

export interface IGems {
  id?: number;
  generatedGems?: string;
  prize?: number;
  initialBet?: number;
  betAmount?: number;
  profit?: number;
  multiplier?: number;
  state?: string;
  difficulty?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  user?: User;
}
