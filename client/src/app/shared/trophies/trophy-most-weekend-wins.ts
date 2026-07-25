import { PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyMostWeekendWins extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(sortOrder, ['🥋'], 'The Weekend Warrior', ['Work hard, play harder'], 'Most Wins On the Weekend');
  }

  calculate(api: ApiService) {
    const winCount: { [playerId: string]: number } = {};
    api.games.list
      .filter((x) => x.DateObj.getDay() === 0 || x.DateObj.getDay() === 6)
      .forEach((g) => {
        g.Winners.forEach((w) => {
          if (winCount[w.PlayerId] === undefined) {
            winCount[w.PlayerId] = 0;
          } else {
            winCount[w.PlayerId]++;
          }
        });
      });

    this.value = Math.max(...Object.values(winCount));
    const playerIds = Object.keys(winCount).filter((x) => winCount[x] === this.value);
    this.array = playerIds.map((id) => api.players.getOne(id)).filter(Boolean) as PlayerEntity[];
  }
}
