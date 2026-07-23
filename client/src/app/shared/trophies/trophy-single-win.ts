import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophySingleWin extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['1️⃣'], 'The One Hit Wonder', ['One and done'], 'Win only 1 game.');
  }

  calculate(api: ApiService) {
    this.array = api.players.list.filter((x) => x.Wins.length === 1);
    this.value = this.array.length;
  }
}
