import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMostWins extends ITrophy {
  constructor() {
    super('👑', 'The Game Master', ['Goats can play boardgames?'], 'Most Wins');
  }

  calculate(players: PlayerEntity[]) {
    this.value = players.find((x) => x.hasMostWins)?.Wins.length ?? 0;
    this.array = players.filter((x) => x.hasMostWins);
  }
}
