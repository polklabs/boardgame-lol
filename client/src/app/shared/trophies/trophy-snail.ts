import { ApiService } from '../services/api.service';
import { ITrophy } from './trophy.model';

export class TrophySnail extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🐌'], 'The Snail', ['Started from the bottom...'], 'Most games before first win');
  }

  calculate(api: ApiService) {
    api.players.list.forEach((p) => {
      const index = p.ScoringGames.findLastIndex((x) => x.Won)
      if (index === -1) {
        return;
      } else {
        // Continue
      }
      
      const count = p.ScoringGames.length - index - 1;
      if (count > this.value) {
        this.value = count;
        this.array = [p];
      } else if (count === this.value) {
        this.array.push(p);
      } else {
        // Skip
      }
    });
  }
}
