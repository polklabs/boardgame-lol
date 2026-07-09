import { differenceInDays, format, max } from 'date-fns';
import { BoardGameEntity, GameEntity, Mode, PlayerEntity } from 'libs/index';

export class StatsModel {
  MostPlays = 0;
  MostPlaysGames: BoardGameEntity[] = [];

  MostPlaysOneDay = 0;
  MostPlaysOneDayDate: string[] = [];

  MostWinsPlayers: PlayerEntity[] = [];
  MostWins = 0;

  MaxUniqueWins = 0;
  MaxUniqueWinsPlayers: PlayerEntity[] = [];

  LongestWinStreak = 0;
  LongestWinStreakPlayers: PlayerEntity[] = [];

  MostTies = 0;
  MostTiesPlayers: PlayerEntity[] = [];

  BestComeback = 0;
  BestComebackPlayers: PlayerEntity[] = [];

  MostWeekendWins = 0;
  MostWeekendWinsPlayers: PlayerEntity[] = [];

  OnlyWon1Game: PlayerEntity[] = [];
  OnlyWon1GameLength = 0;

  FavXPlayerCount = 0;
  FavXPlayer = 0;
  FavXPlayerGame: BoardGameEntity[] = [];

  LastGroupWinGame: BoardGameEntity[] = [];
  LastGroupWinDays = 0;

  private players: PlayerEntity[] = [];
  private games: GameEntity[] = [];
  private boardGames: BoardGameEntity[] = [];

  constructor(players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]) {
    this.players = players.filter((x) => x.IsRealPerson);
    this.games = games;
    this.boardGames = boardGames;

    this.calculateMostPlays();
    this.calculateMostPlaysOneDay();
    this.calculateMostWins();
    this.calculateMostUniqueWins();
    this.calculateLongestStreak();
    this.calculateBestComeback();
    this.calculateMostTies();
    this.calculateOnlyWonOneGame();
    this.calculateMostWeekendWins();
    this.calculateFavXPlayerGame();
    this.calculateLastGroupWinGame();
  }

  calculateMostPlays() {
    this.MostPlays = Math.max(...this.boardGames.map((x) => x.Games.length));
    this.MostPlaysGames = this.boardGames.filter((x) => x.Games.length === this.MostPlays);
  }

  calculateMostPlaysOneDay() {
    const playCount: { [date: string]: number } = {};
    this.games.forEach((g) => {
      const d = g.Date.toString();
      if (playCount[d] === undefined) {
        playCount[d] = 1;
      } else {
        playCount[d] += 1;
      }
    });

    Object.keys(playCount).forEach((k) => {
      if (playCount[k] > this.MostPlaysOneDay) {
        this.MostPlaysOneDay = playCount[k];
        this.MostPlaysOneDayDate = [k];
      } else if (playCount[k] === this.MostPlaysOneDay) {
        this.MostPlaysOneDayDate.push(k);
      } else {
        //Continue
      }
    });
  }

  calculateMostWins() {
    this.MostWins = Math.max(...this.players.map((x) => x.Wins.length));
    this.MostWinsPlayers = this.players.filter((x) => x.Wins.length === this.MostWins);
  }

  calculateMostUniqueWins() {
    const uniqueWins = this.players.map((x) => ({
      player: x,
      count: new Set(x.Wins.map((w) => w.Game?.BoardGameId)).size,
    }));
    this.MaxUniqueWins = uniqueWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.MaxUniqueWinsPlayers = uniqueWins.filter((x) => x.count === this.MaxUniqueWins).map((x) => x.player);
  }

  calculateLongestStreak() {
    const streakPlayers: {player: PlayerEntity, streak: number}[] = [];

    for (const player of this.players) {
      let maxStreak = 0;
      let streak = 0;
      for (const game of this.games) {
        if (game.Winners.some(x => x.PlayerId === player.PlayerId)) {
          streak++;
        } else if (game.Scores.some(x => x.PlayerId === player.PlayerId)) {
          maxStreak = Math.max(maxStreak, streak);
          streak = 0;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({player, streak: maxStreak});
    }

    this.LongestWinStreak = streakPlayers.reduce((prev, curr) => Math.max(prev, curr.streak), 0);
    this.LongestWinStreakPlayers = streakPlayers.filter(x => x.streak === this.LongestWinStreak).map(x => x.player);
  }

  calculateBestComeback() {
    const streakPlayers: {player: PlayerEntity, streak: number}[] = [];

    for (const player of this.players) {
      const loseStreaks: number[] = [];
      let losses = 0;
      for (const game of this.games) {
        if (game.Winners.some(x => x.PlayerId === player.PlayerId)) {
          loseStreaks.push(losses);
          losses = 0;
        } else if (game.Scores.some(x => x.PlayerId === player.PlayerId)) {
          losses++;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({player, streak: Math.max(...loseStreaks)});
    }

    this.BestComeback = streakPlayers.reduce((prev, curr) => Math.max(prev, curr.streak), 0);
    this.BestComebackPlayers = streakPlayers.filter(x => x.streak === this.BestComeback).map(x => x.player);
  }

  calculateMostTies() {
    const tiedWins = this.players.map((x) => ({
      player: x,
      count: x.Wins.filter((w) => (w.Game?.Winners.length ?? 0) > 1).length,
    }));
    this.MostTies = tiedWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.MostTiesPlayers = tiedWins.filter((x) => x.count > 0 && x.count === this.MostTies).map((x) => x.player);
  }

  calculateOnlyWonOneGame() {
    this.OnlyWon1Game = this.players.filter((x) => x.Wins.length === 1);
    this.OnlyWon1GameLength = this.OnlyWon1Game.length;
  }

  calculateMostWeekendWins() {
    const weekend = new Set(['Sun', 'Sat']);
    const winCount: { [playerId: string]: number } = {};
    this.games
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

    this.MostWeekendWins = Math.max(...Object.values(winCount));
    const playerIds = Object.keys(winCount).filter((x) => winCount[x] === this.MostWeekendWins);
    this.MostWeekendWinsPlayers = playerIds
      .map((id) => this.players.find((x) => x.PlayerId === id))
      .filter(Boolean) as PlayerEntity[];
  }

  calculateFavXPlayerGame() {
    this.FavXPlayerCount = Mode(this.games, (x) => x.Players)?.[0]?.Players ?? 0;

    const list: [BoardGameEntity, number][] = this.boardGames.map((x) => [
      x,
      x.Games.filter((g) => g.Players === this.FavXPlayerCount).length,
    ]);
    this.FavXPlayer = Math.max(...list.map((x) => x[1]));
    this.FavXPlayerGame = list.filter((x) => x[1] === this.FavXPlayer).map((x) => x[0]);
  }

  calculateLastGroupWinGame() {
    const groupWins = this.games.filter((x) => x.Winners.length === x.Players);
    const maxDate = max(groupWins.map((x) => x.DateObj));

    this.LastGroupWinGame = groupWins
      .filter((x) => x.DateObj === maxDate)
      .map((x) => x.BoardGame)
      .filter((x) => x !== null) as BoardGameEntity[];

    if (groupWins.length > 0) {
      this.LastGroupWinDays = differenceInDays(new Date(), maxDate);
    } else {
      this.LastGroupWinDays = Infinity;
    }
  }
}
