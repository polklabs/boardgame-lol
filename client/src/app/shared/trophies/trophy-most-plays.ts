import { BoardGameEntity, GameEntity, PlayerEntity } from 'libs/index';
import { ITrophy } from './trophy.model';

export class TrophyMostPlays extends ITrophy {
  constructor() {
    super('💖', 'The Fan Favorite', 'Most Played Game');
  }

  calculate(_players: PlayerEntity[], _games: GameEntity[], boardGames: BoardGameEntity[]) {
    this.value = Math.max(...boardGames.map((x) => x.Games.length));
    this.array = boardGames.filter((x) => x.Games.length === this.value);
  }
}
