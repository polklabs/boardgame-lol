import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyTieBreaker extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['👔'], 'The Tie Breaker', ['There can only be one'], 'Win the most tied games');
  }

  calculate(api: ApiService) {
    const objects = new Map<PlayerEntity, number>();
    api.players.list.forEach((p) => {
      objects.set(
        p,
        p.PlayerGames.reduce((prev, curr) => prev + (curr.TieBreaker && curr.Won ? 1 : 0), 0),
      );
    });
    this.applyValues(objects);
  }
}
