import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyMostPlaysOneDay extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🕹️'], 'Just One More Game', ["Can't Stop, Won't Stop"], 'Max games played in one day');
    this.showArray = false;
  }

  override calculate(api: ApiService): void {
    const playCount: { [date: string]: number } = {};
    api.games.list.forEach((g) => {
      const d = g.Date.toString();
      if (playCount[d] === undefined) {
        playCount[d] = 1;
      } else {
        playCount[d] += 1;
      }
    });

    Object.keys(playCount).forEach((k) => {
      if (playCount[k] > this.value) {
        this.value = playCount[k];
        this.array = [k];
      } else if (playCount[k] === this.value) {
        this.array.push(k);
      } else {
        //Continue
      }
    });
  }
}
