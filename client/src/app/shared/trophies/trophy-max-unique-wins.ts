import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMaxUniqueWins extends ITrophy {
  constructor() {
    super('🧩', 'Jack Of All Trades', 'Most Unique BoardGame Wins');
  }

  calculate(players: PlayerEntity[]) {
    const uniqueWins = players.map((x) => ({
      player: x,
      count: new Set(x.Wins.map((w) => w.Game?.BoardGameId)).size,
    }));
    this.value = uniqueWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.array = uniqueWins.filter((x) => x.count === this.value).map((x) => x.player);
  }
}
