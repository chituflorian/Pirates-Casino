export interface IGameService {
  create: (...args: any[]) => Promise<any>;
  cashout: (...args: any[]) => Promise<any>;
  getGame: (...args: any[]) => Promise<any>;
}
