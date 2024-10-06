export class CreateTowerRespDTO {
  id: number;
  gameId: string;
  userMap: number[][];
  profitSteps: number[];
  difficulty: string;
  state: string;
}
