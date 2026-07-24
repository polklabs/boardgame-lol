import { ApiService } from '../services/api.service';
import { ITrophy } from './trophy.model';

export class TrophyMostPlays extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['💖'], 'The Fan Favorite', ["It's a really fun game!"], 'Most Played Game');
  }

  calculate(api: ApiService) {
    this.value = Math.max(...api.boardGames.list.map((x) => x.Games.length));
    this.array = api.boardGames.list.filter((x) => x.Games.length === this.value);
  }
}
