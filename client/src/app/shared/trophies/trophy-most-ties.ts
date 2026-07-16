import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMostTies extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🤝'], 'The Great Compromiser', ['Call it a truce?'], 'Most tied wins');
  }

  calculate(players: PlayerEntity[]) {
    const tiedWins = players.map((x) => ({
      player: x,
      count: x.Wins.filter((w) => (w.Game?.WinnerTeams.length ?? 0) > 1).length,
    }));
    this.value = tiedWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.array = tiedWins.filter((x) => x.count > 0 && x.count === this.value).map((x) => x.player);
  }
}
