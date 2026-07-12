import { BoardGameEntity, GameEntity, Mode, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyFavXPlayerGame extends ITrophy {
  constructor() {
    super(
      'U+003{FavXPlayerCount} U+FE0F U+20E3',
      'Favorite {FavXPlayerCount} Player Game',
      ["Oh, it's you {FavXPlayerCount} again..."],
      'Player # mode; Max # of plays with player #',
    );
  }

  calculate(_players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]) {
    this.extra['FavXPlayerCount'] = Mode(games, (x) => x.Players)?.[0]?.Players ?? 0;

    if (this.extra['FavXPlayerCount'] >= 0 && this.extra['FavXPlayerCount'] <= 10) {
      const list: [BoardGameEntity, number][] = boardGames.map((x) => [
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
