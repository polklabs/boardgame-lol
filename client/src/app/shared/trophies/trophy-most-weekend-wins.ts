import { GameEntity, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';
import { format } from 'date-fns';

export class TrophyMostWeekendWins extends ITrophy {
  constructor() {
    super('🥋', 'The Weekend Warrior', 'Most Wins On the Weekend');
  }

  calculate(players: PlayerEntity[], games: GameEntity[]) {
    const weekend = new Set(['Sun', 'Sat']);
    const winCount: { [playerId: string]: number } = {};
    games
      .filter((x) => weekend.has(format(x.DateObj, 'eee')))
      .forEach((g) => {
        g.Winners.forEach((w) => {
          if (winCount[w.PlayerId ?? ''] === undefined) {
            winCount[w.PlayerId ?? ''] = 0;
          } else {
            winCount[w.PlayerId ?? '']++;
          }
        });
      });

    this.value = Math.max(...Object.values(winCount));
    const playerIds = Object.keys(winCount).filter((x) => winCount[x] === this.value);
    this.array = playerIds.map((id) => players.find((x) => x.PlayerId === id)).filter(Boolean) as PlayerEntity[];
  }
}
