import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMaxUniqueWins extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🧩'], 'The Collector', ['A real Jack of All Trades'], 'Most unique board game wins.');
  }

  calculate(players: PlayerEntity[]) {
    const uniqueWins = players.map((x) => ({
      item: x,
      count: new Set(x.Wins.map((w) => w.Game?.BoardGameId)).size,
    }));
    this.applyValues(uniqueWins);
  }
}
