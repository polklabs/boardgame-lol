import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyHoarder extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, '💎', 'The Hoarder', ['Might be a dragon.', "It's all MINE!"], 'Highest point sum, excluding team plays');
  }

  calculate(players: PlayerEntity[]) {
    const pointTotals: { player: PlayerEntity; total: number }[] = [];
    players.forEach((player: PlayerEntity) => {
      pointTotals.push({
        player,
        total: player.PlayerGames.reduce(
          (p, c) => p + ((c.Game?.BoardGame?.ScoreType ?? '') === 'points' && !c.Team ? c.Points ?? 0 : 0),
          0,
        ),
      });
    });

    this.value = pointTotals.reduce((prev, curr) => Math.max(prev, curr.total), 0);
    this.array = pointTotals.filter((x) => this.value > 0 && x.total === this.value).map((x) => x.player);
  }
}
