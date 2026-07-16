import { PlayerEntity } from 'libs/index';
import { ApplyObj, ITrophy } from './trophy.model';

export class TrophyHoarder extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      '💎',
      'The Hoarder',
      ['Might be a dragon.', "It's all MINE!"],
      'Highest point sum, excluding team plays',
    );
  }

  calculate(players: PlayerEntity[]) {
    const pointTotals: ApplyObj = [];
    players.forEach((player: PlayerEntity) => {
      pointTotals.push({
        item: player,
        count: player.PlayerGames.reduce(
          (p, c) => p + ((c.Game?.BoardGame?.ScoreType ?? '') === 'points' && !c.Team ? c.Points ?? 0 : 0),
          0,
        ),
      });
    });

    this.applyValues(pointTotals);
  }
}
