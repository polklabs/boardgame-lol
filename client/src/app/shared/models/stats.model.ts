import { differenceInDays, format, max } from 'date-fns';
import { BoardGameEntity, GameEntity, Mode, PlayerEntity } from 'libs/index';

export type StatNumbers =
  | 'MostPlays'
  | 'MostPlaysOneDay'
  | 'MostWins'
  | 'MaxUniqueWins'
  | 'LongestWinStreak'
  | 'MostTies'
  | 'BestComeback'
  | 'MostWeekendWins'
  | 'OnlyWon1GameLength'
  | 'FavXPlayerCount'
  | 'FavXPlayer'
  | 'LastGroupWinDays'
  | 'MostLosses';

export type StatArrays =
  | 'MostPlaysGames'
  | 'MostPlaysOneDayDate'
  | 'MostWinsPlayers'
  | 'MaxUniqueWinsPlayers'
  | 'LongestWinStreakPlayers'
  | 'MostTiesPlayers'
  | 'BestComebackPlayers'
  | 'MostWeekendWinsPlayers'
  | 'OnlyWon1Game'
  | 'FavXPlayerGame'
  | 'LastGroupWinGame'
  | 'MostLosses';

export class StatsModel {
  numbers: Record<StatNumbers, number> = {
    MostPlays: 0,
    MostPlaysOneDay: 0,
    MostWins: 0,
    MaxUniqueWins: 0,
    LongestWinStreak: 0,
    MostTies: 0,
    BestComeback: 0,
    MostWeekendWins: 0,
    OnlyWon1GameLength: 0,
    FavXPlayerCount: 0,
    FavXPlayer: 0,
    LastGroupWinDays: 0,
    MostLosses: 0,
  };

  arrays: Record<StatArrays, (PlayerEntity | GameEntity | BoardGameEntity | string)[]> = {
    MostPlaysGames: [],
    MostPlaysOneDayDate: [],
    MostWinsPlayers: [],
    MaxUniqueWinsPlayers: [],
    LongestWinStreakPlayers: [],
    MostTiesPlayers: [],
    BestComebackPlayers: [],
    MostWeekendWinsPlayers: [],
    OnlyWon1Game: [],
    FavXPlayerGame: [],
    LastGroupWinGame: [],
    MostLosses: [],
  };

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
    this.calculateMostLosses();
  }

  calculateMostPlays() {
    this.numbers.MostPlays = Math.max(...this.boardGames.map((x) => x.Games.length));
    this.arrays.MostPlaysGames = this.boardGames.filter((x) => x.Games.length === this.numbers.MostPlays);
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
      if (playCount[k] > this.numbers.MostPlaysOneDay) {
        this.numbers.MostPlaysOneDay = playCount[k];
        this.arrays.MostPlaysOneDayDate = [k];
      } else if (playCount[k] === this.numbers.MostPlaysOneDay) {
        this.arrays.MostPlaysOneDayDate.push(k);
      } else {
        //Continue
      }
    });
  }

  calculateMostWins() {
    this.numbers.MostWins = Math.max(...this.players.map((x) => x.Wins.length));
    this.arrays.MostWinsPlayers = this.players.filter((x) => x.Wins.length === this.numbers.MostWins);
  }

  calculateMostUniqueWins() {
    const uniqueWins = this.players.map((x) => ({
      player: x,
      count: new Set(x.Wins.map((w) => w.Game?.BoardGameId)).size,
    }));
    this.numbers.MaxUniqueWins = uniqueWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.arrays.MaxUniqueWinsPlayers = uniqueWins
      .filter((x) => x.count === this.numbers.MaxUniqueWins)
      .map((x) => x.player);
  }

  calculateLongestStreak() {
    const streakPlayers: { player: PlayerEntity; streak: number }[] = [];

    for (const player of this.players) {
      let maxStreak = 0;
      let streak = 0;
      for (const game of this.games) {
        if (game.Winners.some((x) => x.PlayerId === player.PlayerId)) {
          streak++;
        } else if (game.Scores.some((x) => x.PlayerId === player.PlayerId)) {
          maxStreak = Math.max(maxStreak, streak);
          streak = 0;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({ player, streak: maxStreak });
    }

    this.numbers.LongestWinStreak = streakPlayers.reduce((prev, curr) => Math.max(prev, curr.streak), 0);
    this.arrays.LongestWinStreakPlayers = streakPlayers
      .filter((x) => x.streak === this.numbers.LongestWinStreak)
      .map((x) => x.player);
  }

  calculateBestComeback() {
    const streakPlayers: { player: PlayerEntity; streak: number }[] = [];

    for (const player of this.players) {
      const loseStreaks: number[] = [];
      let losses = 0;
      for (const game of this.games) {
        if (game.Winners.some((x) => x.PlayerId === player.PlayerId)) {
          loseStreaks.push(losses);
          losses = 0;
        } else if (game.Scores.some((x) => x.PlayerId === player.PlayerId)) {
          losses++;
        } else {
          // Did not play, streak continues
        }
      }

      streakPlayers.push({ player, streak: Math.max(...loseStreaks) });
    }

    this.numbers.BestComeback = streakPlayers.reduce((prev, curr) => Math.max(prev, curr.streak), 0);
    this.arrays.BestComebackPlayers = streakPlayers
      .filter((x) => x.streak === this.numbers.BestComeback)
      .map((x) => x.player);
  }

  calculateMostTies() {
    const tiedWins = this.players.map((x) => ({
      player: x,
      count: x.Wins.filter((w) => (w.Game?.Winners.length ?? 0) > 1).length,
    }));
    this.numbers.MostTies = tiedWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.arrays.MostTiesPlayers = tiedWins
      .filter((x) => x.count > 0 && x.count === this.numbers.MostTies)
      .map((x) => x.player);
  }

  calculateOnlyWonOneGame() {
    this.arrays.OnlyWon1Game = this.players.filter((x) => x.Wins.length === 1);
    this.numbers.OnlyWon1GameLength = this.arrays.OnlyWon1Game.length;
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

    this.numbers.MostWeekendWins = Math.max(...Object.values(winCount));
    const playerIds = Object.keys(winCount).filter((x) => winCount[x] === this.numbers.MostWeekendWins);
    this.arrays.MostWeekendWinsPlayers = playerIds
      .map((id) => this.players.find((x) => x.PlayerId === id))
      .filter(Boolean) as PlayerEntity[];
  }

  calculateFavXPlayerGame() {
    this.numbers.FavXPlayerCount = Mode(this.games, (x) => x.Players)?.[0]?.Players ?? 0;

    const list: [BoardGameEntity, number][] = this.boardGames.map((x) => [
      x,
      x.Games.filter((g) => g.Players === this.numbers.FavXPlayerCount).length,
    ]);
    this.numbers.FavXPlayer = Math.max(...list.map((x) => x[1]));
    this.arrays.FavXPlayerGame = list.filter((x) => x[1] === this.numbers.FavXPlayer).map((x) => x[0]);
  }

  calculateLastGroupWinGame() {
    const groupWins = this.games.filter((x) => x.Winners.length === x.Players);
    const maxDate = max(groupWins.map((x) => x.DateObj));

    this.arrays.LastGroupWinGame = groupWins
      .filter((x) => x.DateObj === maxDate)
      .map((x) => x.BoardGame)
      .filter((x) => x !== null) as BoardGameEntity[];

    if (groupWins.length > 0) {
      this.numbers.LastGroupWinDays = differenceInDays(new Date(), maxDate);
    } else {
      this.numbers.LastGroupWinDays = Infinity;
    }
  }

  calculateMostLosses() {
    const loser = this.players.reduce((prev: PlayerEntity | undefined, curr) => {
      let prevLosses = 0;
      if (prev) {
        prevLosses = prev.PlayerGames.length - prev.Wins.length;
      } else {
        // continue
      }
      const currLosses = curr.PlayerGames.length - curr.Wins.length;

      if (prevLosses >= currLosses) {
        return prev;
      } else {
        return curr;
      }
    }, undefined);

    this.numbers.MostLosses = (loser?.PlayerGames.length ?? 0) - (loser?.Wins.length ?? 0);
    this.arrays.MostLosses = this.players.filter(
      (x) => x.PlayerGames.length - x.Wins.length === this.numbers.MostLosses,
    );
  }
}
