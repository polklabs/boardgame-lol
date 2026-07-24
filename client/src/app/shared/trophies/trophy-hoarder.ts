import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyHoarder extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['💎'],
      'The Hoarder',
      ['Might be a dragon.', "It's all MINE!"],
      'Highest point sum, excluding team plays',
    );
  }

  calculate(api: ApiService) {
    const pointTotals = new Map<PlayerEntity, number>();
    api.players.list.forEach((player: PlayerEntity) => {
      pointTotals.set(
        player,
        player.PlayerGames.reduce(
          (p, c) => p + ((c.Game?.BoardGame?.ScoreType ?? '') === 'points' && !c.Team ? c.Points ?? 0 : 0),
          0,
        ),
      );
    });

    this.applyValues(pointTotals);
  }
}
