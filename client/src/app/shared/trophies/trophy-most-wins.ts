import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyMostWins extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['👑'], 'The Game Master', ['Goats can play boardgames?'], 'Most Wins');
  }

  calculate(api: ApiService) {
    this.value = api.players.list.find((x) => x.hasMostWins)?.Wins.length ?? 0;
    this.array = api.players.list.filter((x) => x.hasMostWins);
  }
}
