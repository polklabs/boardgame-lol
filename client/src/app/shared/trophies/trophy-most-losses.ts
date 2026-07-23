import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

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

  calculate(api: ApiService) {
    const objects = new Map<PlayerEntity, number>();
    api.players.list.forEach((player) => {
      objects.set(player, player.LossCount - player.WinCount);
    });
    this.applyValues(objects);
  }
}
