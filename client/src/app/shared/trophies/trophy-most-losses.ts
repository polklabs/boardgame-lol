import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMostLosses extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      '🏅',
      'The Participator',
      ['At least you tried', "You'll get em next time"],
      '{value} = Losses - Wins; {value} losses > 0',
    );
  }

  calculate(players: PlayerEntity[]) {
    const loser = players.reduce((prev: PlayerEntity | undefined, curr) => {
      let prevLosses = 0;
      if (prev) {
        prevLosses = prev.LossCount - prev.WinCount;
      } else {
        // continue
      }

      if (prevLosses >= curr.LossCount - curr.WinCount) {
        return prev;
      } else {
        return curr;
      }
    }, undefined);

    this.value = (loser?.LossCount ?? 0) - (loser?.WinCount ?? 0);
    this.array = players.filter((x) => this.value > 0 && x.LossCount - x.WinCount === this.value);
  }
}
