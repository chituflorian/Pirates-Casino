import { User } from '../../users/entities/user.entity';

export interface ITower {
  success?: boolean;
  id?: number;
  gameId?: string;
  generatedMap?: number[][];
  userMap?: number[][];
  profitSteps?: number[];
  tilesOpened?: number;
  initialBet?: number;
  betAmount?: number;
  profit?: number;
  multiplier?: number;
  difficulty?: string;
  state?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  user?: User;
}
