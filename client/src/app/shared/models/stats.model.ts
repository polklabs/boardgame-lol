import { BoardGameEntity, GameEntity, PlayerEntity } from "libs/index";

export class StatsModel {
  Champions: PlayerEntity[] = [];
  MaxPlayerWins = 0;
  MaxGamePlays = 0;

  constructor(players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]) {
    this.MaxPlayerWins = Math.max(...players.map(x => x.Wins.length));
    this.MaxGamePlays = Math.max(...boardGames.map(x => x.Games.length));

    this.Champions = players.filter(x => x.Wins.length === this.MaxPlayerWins);
  }
}