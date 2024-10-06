import { User } from '../../users/entities/user.entity';

interface IMines {
  id?: number;
  gameId?: string;
  generatedMap?: number[][];
  userMap?: number[][];
  profitSteps?: number[];
  mines?: number;
  tilesOpened?: number;
  initialBet?: number;
  betAmount?: number;
  profit?: number;
  multiplier?: number;
  state?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  user?: User;
}

export default IMines;
