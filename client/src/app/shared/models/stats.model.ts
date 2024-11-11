import { format } from 'date-fns';
import { BoardGameEntity, GameEntity, PlayerEntity } from 'libs/index';

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
      count: [...new Set(x.Wins.map((w) => w.Game?.BoardGameId))].length,
    }));
    this.MaxUniqueWins = uniqueWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.MaxUniqueWinsPlayers = uniqueWins.filter((x) => x.count === this.MaxUniqueWins).map((x) => x.player);
  }

  calculateLongestStreak() {
    const winners = this.games.map((x) => x.Winners.map((w) => w.PlayerId));

    let totalMaxStreak = 0;
    let streakPlayers: PlayerEntity[] = [];

    for (const player of this.players) {
      let maxStreak = 0;
      let streak = 0;
      for (const playerIds of winners) {
        if (playerIds.includes(player.PlayerId)) {
          streak++;
        } else {
          maxStreak = Math.max(maxStreak, streak);
          streak = 0;
        }
      }

      if (maxStreak > totalMaxStreak) {
        totalMaxStreak = maxStreak;
        streakPlayers = [player];
      } else if (maxStreak === totalMaxStreak) {
        streakPlayers.push(player);
      } else {
        // Nothing
      }
    }

    this.LongestWinStreak = totalMaxStreak;
    this.LongestWinStreakPlayers = streakPlayers;
  }

  calculateBestComeback() {
    const winners = this.games.map((x) => x.Winners.map((w) => w.PlayerId));

    let totalMaxStreak = 0;
    let streakPlayers: PlayerEntity[] = [];

    for (const player of this.players) {
      let maxStreak = 0;
      let streak = 0;
      let firstFind = true;
      for (const playerIds of winners) {
        if (playerIds.includes(player.PlayerId)) {
          if (firstFind === false) {
            maxStreak = Math.max(maxStreak, streak);
          } else {
            // Skip
          }
          streak = 0;
          firstFind = false;
        } else {
          streak++;
        }
      }

      if (maxStreak > totalMaxStreak) {
        totalMaxStreak = maxStreak;
        streakPlayers = [player];
      } else if (maxStreak === totalMaxStreak) {
        streakPlayers.push(player);
      } else {
        // Nothing
      }
    }

    this.BestComeback = totalMaxStreak;
    this.BestComebackPlayers = streakPlayers;
  }

  calculateMostTies() {
    const tiedWins = this.players.map((x) => ({
      player: x,
      count: x.Wins.filter((w) => (w.Game?.Winners.length ?? 0) > 1).length,
    }));
    this.MostTies = tiedWins.reduce((max, x) => Math.max(max, x.count), 0);
    this.MostTiesPlayers = tiedWins.filter((x) => x.count === this.MostTies).map((x) => x.player);
  }

  calculateOnlyWonOneGame() {
    this.OnlyWon1Game = this.players.filter((x) => x.Wins.length === 1);
  }

  calculateMostWeekendWins() {
    const weekend = ['Sun', 'Sat'];
    const winCount: { [playerId: string]: number } = {};
    this.games
      .filter((x) => weekend.includes(format(x.DateObj, 'eee')))
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
      .filter((x) => x) as PlayerEntity[];
  }
}
