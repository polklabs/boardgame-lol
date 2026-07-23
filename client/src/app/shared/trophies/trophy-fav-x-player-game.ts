import { BoardGameEntity, Mode } from 'libs/index';
import { ITrophy } from './trophy.model';
import { ApiService } from '../services/api.service';

export class TrophyFavXPlayerGame extends ITrophy {
  constructor(sortOrder: number | null = null) {
    super(
      sortOrder,
      ['U+003{FavXPlayerCount} U+FE0F U+20E3'],
      'Favorite {FavXPlayerCount} Player Game',
      ["Oh, it's you {FavXPlayerCount} again..."],
      'Player # mode; Max # of plays with player #',
    );
  }

  calculate(api: ApiService) {
    this.extra['FavXPlayerCount'] = Mode(api.games.list, (x) => x.Players)?.[0]?.Players ?? 0;

    if (this.extra['FavXPlayerCount'] >= 0 && this.extra['FavXPlayerCount'] <= 10) {
      const list: [BoardGameEntity, number][] = api.boardGames.list.map((x) => [
        x,
        x.Games.filter((g) => g.Players === this.extra['FavXPlayerCount']).length,
      ]);
      this.value = Math.max(...list.map((x) => x[1]));
      this.array = list.filter((x) => x[1] === this.value).map((x) => x[0]);
    } else {
      this.value = 0;
      this.array = [];
    }
  }
}
