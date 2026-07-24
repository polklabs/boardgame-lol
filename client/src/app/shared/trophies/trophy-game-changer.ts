import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { differenceInDays, max, min } from 'date-fns';
import { ApiService } from '../services/api.service';

export class TrophyGameChanger extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['⌛'],
      'The Game Changer',
      ["I've been here the whole time"],
      'Most time between first and last play.',
    );
    this.showValue = false;
  }

  calculate(api: ApiService) {
    const dateMap = new Map<PlayerEntity, number>();
    api.players.list.forEach((player: PlayerEntity) => {
      const dates = player.PlayerGames.map((x) => x.Game?.DateObj).filter((x) => x !== undefined);
      dateMap.set(player, dates.length > 0 ? differenceInDays(max(dates), min(dates)) : -Infinity);
    });

    this.applyValues(dateMap);
  }
}
