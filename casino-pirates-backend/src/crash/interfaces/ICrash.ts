import { BET_STATE, GAME_STATE } from '../enums/state';

export interface ICrashGame {
  gameId: string;
  round_number: number;
  round_random: number;
  round_hash: string;
  round_salt: string;
  state: GAME_STATE;
}

export interface IChart {
  x: number;
  y: number;
  pow: number;
  value: number;
}

export interface IBet {
  betId: string;
  userId: number;
  wallet?: string;
  gameId: string;
  name: string;
  amount: number;
  initialBet: number;
  winAmount: number;
  multiplier: number | null;
  autoCashOut: number;
  state: BET_STATE;
  currency?: number;
  profile?: string;
}
