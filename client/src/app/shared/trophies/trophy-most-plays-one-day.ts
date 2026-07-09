import { PlayerEntity, GameEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMostPlaysOneDay extends ITrophy {
  constructor() {
    super('🕹️', 'Just One More Game', 'Most Games Played In One Day');
  }

  override calculate(_players: PlayerEntity[], games: GameEntity[]): void {
    const playCount: { [date: string]: number } = {};
    games.forEach((g) => {
      const d = g.Date.toString();
      if (playCount[d] === undefined) {
        playCount[d] = 1;
      } else {
        playCount[d] += 1;
      }
    });

    Object.keys(playCount).forEach((k) => {
      if (playCount[k] > this.value) {
        this.value = playCount[k];
        this.array = [k];
      } else if (playCount[k] === this.value) {
        this.array.push(k);
      } else {
        //Continue
      }
    });
  }
}
