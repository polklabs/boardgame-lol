import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophySingleWin extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['1️⃣'], 'The One Hit Wonder', ['One and done'], 'Win only 1 game.');
  }

  calculate(players: PlayerEntity[]) {
    this.array = players.filter((x) => x.Wins.length === 1);
    this.value = this.array.length;
  }
}
