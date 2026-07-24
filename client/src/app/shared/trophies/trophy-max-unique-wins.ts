import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyMaxUniqueWins extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🧩'], 'The Collector', ['A real Jack of All Trades'], 'Most unique board game wins.');
  }

  calculate(api: ApiService) {
    const uniqueWins = new Map<PlayerEntity, number>();
    api.players.list.forEach((p) => {
      uniqueWins.set(p, new Set(p.Wins.map((w) => w.Game?.BoardGameId)).size);
    });
    this.applyValues(uniqueWins);
  }
}
