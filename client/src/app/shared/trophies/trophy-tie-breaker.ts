import { PlayerEntity } from 'libs/index';
import { ApplyObj, ITrophy } from './trophy.model';

export class TrophyTieBreaker extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['👔'], 'The Tie Breaker', ['There can only be one'], 'Win the most tied games');
  }

  calculate(players: PlayerEntity[]) {
    const objects: ApplyObj = players.map((player) => ({
      item: player,
      count: player.PlayerGames.reduce((prev, curr) => prev + (curr.TieBreaker && curr.Won ? 1 : 0), 0),
    }));
    this.applyValues(objects);
  }
}
