import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';
import { PlayerEntity } from 'libs/index';

export class TrophyEventChampion extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🏆'], 'The Event Champion', ['Rising to the challenge'], 'Most Wins during events');
  }

  calculate(api: ApiService) {
    const options = new Map<PlayerEntity, number>();
    api.players.list.forEach((p) => {
      p.ScoringGames.forEach((pg) => {
        if (pg.Won && (pg.Game?.Events.length ?? 0) > 0) {
          options.set(p, (options.get(p) ?? 0) + 1);
        } else {
          // Skip
        }
      });
    });

    this.applyValues(options);
  }
}
