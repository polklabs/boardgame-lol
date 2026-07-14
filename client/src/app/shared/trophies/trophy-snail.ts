import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophySnail extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, '🐌', 'The Snail', ["Started from the bottom now I'm here"], 'Most games before first win');
  }

  calculate(players: PlayerEntity[]) {
    players.forEach((p) => {
      const length = p.PlayerGames.findIndex((x) => x.Won);
      if (length > this.value) {
        this.value = length;
        this.array = [p];
      } else if (length === this.value) {
        this.array.push(p);
      } else {
        // Skip
      }
    });
  }
}
