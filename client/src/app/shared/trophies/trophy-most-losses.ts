import { PlayerEntity } from 'libs/index';
import { ApplyObj, ITrophy } from './trophy.model';

export class TrophyMostLosses extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['🏅'],
      'The Participator',
      ['At least you tried', "You'll get em next time"],
      'Losses - Wins = {value} and losses > 0',
    );
  }

  calculate(players: PlayerEntity[]) {
    const objects: ApplyObj = players.map((player) => ({ item: player, count: player.LossCount - player.WinCount }));
    this.applyValues(objects);
  }
}
