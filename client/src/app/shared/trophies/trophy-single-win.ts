import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophySingleWin extends ITrophy {
  constructor() {
    super('1️⃣', 'The One Hit Wonder', 'Only Win 1 Game');
  }

  calculate(players: PlayerEntity[]) {
    this.array = players.filter((x) => x.Wins.length === 1);
    this.value = this.array.length;
  }
}
