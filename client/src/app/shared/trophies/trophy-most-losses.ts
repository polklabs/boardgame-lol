import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMostLosses extends ITrophy {
  constructor() {
    super('🏅', 'Participation Trophy', 'Most Losses');
  }

  calculate(players: PlayerEntity[]) {
    const loser = players.reduce((prev: PlayerEntity | undefined, curr) => {
      let prevLosses = 0;
      if (prev) {
        prevLosses = prev.PlayerGames.length - prev.Wins.length;
      } else {
        // continue
      }
      const currLosses = curr.PlayerGames.length - curr.Wins.length;

      if (prevLosses >= currLosses) {
        return prev;
      } else {
        return curr;
      }
    }, undefined);

    this.value = (loser?.PlayerGames.length ?? 0) - (loser?.Wins.length ?? 0);
    this.array = players.filter((x) => x.PlayerGames.length - x.Wins.length === this.value);
  }
}
