import { TagEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyGrimReaper extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['💀', '☠️'], 'The Grim Reaper', ["Death doesn't play dice"], 'Most common cause of death');
  }

  calculate(api: ApiService) {
    const object = new Map<TagEntity, number>();

    for (const game of api.games.list) {
      for (const pg of game.Scores) {
        pg.Tags.filter((t) => t.Category === 'death-cause').forEach((t) => object.set(t, (object.get(t) ?? 0) + 1));
      }
    }

    this.applyValues(object);
  }
}
