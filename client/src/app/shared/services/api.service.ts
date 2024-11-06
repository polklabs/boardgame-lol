import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { BehaviorSubject } from 'rxjs';
import {
  BoardGameEntity,
  ClubEntity,
  GameEntity,
  GameReturn,
  GameWrapper,
  PlayerEntity,
  PlayerGameEntity,
} from 'libs/index';
import { StatsModel } from '../models/stats.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Instances
  private _publicClubs: ClubEntity[] = [];
  private _club?: ClubEntity;
  private _stats?: StatsModel;
  private _boardGameList: BoardGameEntity[] = [];
  private _playerList: PlayerEntity[] = [];
  private _gameList: GameEntity[] = [];
  private _playerGameList: PlayerGameEntity[] = [];

  // Observables
  readonly publicClubs$ = new BehaviorSubject<typeof this._publicClubs>([]);
  readonly club$ = new BehaviorSubject<typeof this._club>(undefined);
  readonly stats$ = new BehaviorSubject<typeof this._stats>(undefined);
  readonly boardGameList$ = new BehaviorSubject<typeof this._boardGameList>([]);
  readonly playerList$ = new BehaviorSubject<typeof this._playerList>([]);
  readonly gameList$ = new BehaviorSubject<typeof this._gameList>([]);
  readonly playerGameList$ = new BehaviorSubject<typeof this._playerGameList>([]);

  // Club
  get club() {
    return this._club;
  }
  get clubId() {
    return this._club?.ClubId;
  }
  private set club(club: ClubEntity | undefined) {
    this._club = new ClubEntity(club, true);
    this.club$.next(this._club);
  }

  // Stats
  private set stats(stats: StatsModel | undefined) {
    this._stats = stats;
    this.stats$.next(stats);
  }

  // Board Games
  get boardGameList() {
    return this._boardGameList;
  }
  private set boardGameList(boardGameList: BoardGameEntity[]) {
    this._boardGameList = boardGameList.map((x) => new BoardGameEntity(x, true));
    this.boardGameList$.next(this._boardGameList);
  }

  // Players
  get playerList() {
    return this._playerList;
  }
  private set playerList(playerList: PlayerEntity[]) {
    this._playerList = playerList.map((x) => new PlayerEntity(x, true));
    this.playerList$.next(this._playerList);
  }

  // Games
  get gameList() {
    return this._gameList;
  }
  private set gameList(gameList: GameEntity[]) {
    this._gameList = gameList.map((x) => new GameEntity(x, true));
    this.gameList$.next(this._gameList);
  }

  // Player Games
  get playerGameList() {
    return this._playerGameList;
  }
  private set playerGameList(playerGameList: PlayerGameEntity[]) {
    this._playerGameList = playerGameList.map((x) => new PlayerGameEntity(x, true));
    this.playerGameList$.next(this._playerGameList);
  }

  // Public Clubs
  get publicClubs() {
    return this._publicClubs;
  }
  private set publicClubs(publicClubs: ClubEntity[]) {
    this._publicClubs = publicClubs.map((x) => new ClubEntity(x, true));
    this.publicClubs$.next(this._publicClubs);
  }

  constructor(private httpService: HttpService) {}

  unloadClub() {
    this.club = undefined;
    this.boardGameList = [];
    this.playerList = [];
    this.gameList = [];
    this.playerGameList = [];
  }

  async fetchPublicClubs() {
    const data = await this.httpService.get<ClubEntity[]>(['api', 'clubs']);

    if (!data) {
      return;
    } else {
      // continue
    }

    this.publicClubs = data;
  }

  async fetchClub(clubId: string) {
    if (this.clubId === clubId) {
      console.log('Club already fetched');
      return;
    } else {
      // continue
    }

    this.unloadClub();

    const data = await this.httpService.get<{
      Club?: ClubEntity;
      Games: GameEntity[];
      PlayerGames: PlayerGameEntity[];
      BoardGames: BoardGameEntity[];
      Players: PlayerEntity[];
    }>(['api', 'club', clubId]);

    if (!data?.Club) {
      return;
    } else {
      // continue
    }

    this.club = data.Club;
    this.boardGameList = data.BoardGames;
    this.playerList = data.Players;
    this.gameList = data.Games;
    this.playerGameList = data.PlayerGames;
    this.updateReferences();
  }

  async postClub(isNew: boolean, data: ClubEntity) {
    let result: ClubEntity | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'club'], data);
    } else {
      result = await this.httpService.patch(['api', 'club'], data);
    }

    if (result) {
      this.unloadClub();
      this.club = result;
      return true;
    } else {
      return false;
    }
  }

  async postGame(isNew: boolean, data: GameWrapper) {
    let result: GameReturn | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'game'], data);
    } else {
      result = await this.httpService.patch(['api', 'game'], data);
    }

    if (result) {
      const gameIndex = this.gameList.findIndex((x) => x.GameId === result!.Game.GameId);
      if (gameIndex >= 0) {
        this.gameList[gameIndex] = result.Game;
        this.gameList = this._gameList;
      } else {
        this.gameList = [...this.gameList, result.Game];
      }

      result.PlayerGames.forEach((pg) => {
        const pgIndex = this.playerGameList.findIndex((x) => x.PlayerGameId === pg.PlayerGameId);
        if (pgIndex >= 0) {
          this.playerGameList[pgIndex] = pg;
          this.playerGameList = this._playerGameList;
        } else {
          this.playerGameList = [...this.playerGameList, pg];
        }
      });
      this.boardGameList = result.BoardGames;
      this.playerList = result.Players;
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async postPlayer(isNew: boolean, entity: PlayerEntity) {
    let result: PlayerEntity | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'player'], entity);
    } else {
      result = await this.httpService.patch(['api', 'player'], entity);
    }

    if (result) {
      const index = this.playerList.findIndex((x) => x.PlayerId === result!.PlayerId);
      if (index >= 0) {
        this.playerList[index] = result;
        this.playerList = this._playerList;
      } else {
        this.playerList = [...this._playerList, result];
      }
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async postBoardGame(isNew: boolean, entity: BoardGameEntity) {
    let result: BoardGameEntity | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'board-game'], entity);
    } else {
      result = await this.httpService.patch(['api', 'board-game'], entity);
    }

    if (result) {
      const index = this.boardGameList.findIndex((x) => x.BoardGameId === result!.BoardGameId);
      if (index >= 0) {
        this.boardGameList[index] = result;
        this.boardGameList = this._boardGameList;
      } else {
        this.boardGameList = [...this._boardGameList, result];
      }
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async deleteGame(gameId: string | null) {
    if (gameId === null) {
      console.log('gameId is null');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'game', this.clubId, gameId]);

    if (result) {
      this.gameList = this.gameList.filter((x) => x.GameId !== gameId);
      this.playerGameList = this.playerGameList.filter((x) => x.GameId !== gameId);
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async updateGameIndex(gameId: string | null, direction: number) {
    const result = await this.httpService.patch<null, GameEntity[]>(
      ['api', 'game', this.clubId, gameId, direction],
      null,
    );

    if (result) {
      result.forEach((g) => {
        const index = this.gameList.findIndex((x) => x.GameId === g.GameId);
        if (index !== -1) {
          this.gameList[index] = g;
        } else {
          this.gameList.push(g);
        }
      });
      this.gameList = [...this.gameList];
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async deletePlayer(playerId: string | null) {
    if (playerId === null) {
      console.log('playerId is null');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'player', this.clubId, playerId]);

    if (result) {
      this.playerList = this.playerList.filter((x) => x.PlayerId !== playerId);
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async deleteBoardGame(boardGameId: string | null) {
    if (boardGameId === null) {
      console.log('boardGameId is null');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'board-game', this.clubId, boardGameId]);

    if (result) {
      this.boardGameList = this.boardGameList.filter((x) => x.BoardGameId !== boardGameId);
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async deleteClub(clubId: string | null) {
    if (clubId === null) {
      console.log('clubId');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'club', clubId]);

    if (result) {
      this.unloadClub();
      return true;
    } else {
      return false;
    }
  }

  private updateReferences() {
    this.gameList.sort(
      (a, b) => a.Date.toString().localeCompare(b.Date.toString()) || (a.SortIndex ?? 0) - (b.SortIndex ?? 0),
    );
    this.gameList.forEach((game) => {
      game.BoardGame = this.boardGameList.find((x) => x.BoardGameId === game.BoardGameId) ?? null;
      game.Scores = this.playerGameList
        .filter((x) => x.GameId === game.GameId)
        .sort((a, b) => {
          switch (game?.BoardGame?.ScoreType) {
            case 'rank':
              return (a.Points ?? 0) - (b.Points ?? 0);
            case 'win-lose':
              return (b.Points ?? 0) - (a.Points ?? 0);
            case 'points':
            default:
              return (b.Points ?? 0) - (a.Points ?? 0);
          }
        });
    });

    this.playerGameList.forEach((pg) => {
      pg.Player = this.playerList.find((x) => x.PlayerId === pg.PlayerId) ?? null;
      pg.Game = this.gameList.find((x) => x.GameId === pg.GameId) ?? null;
    });

    this.boardGameList.forEach((bg) => {
      bg.Games = this.gameList.filter((x) => x.BoardGameId === bg.BoardGameId);
    });

    this.playerList.forEach((p) => {
      p.PlayerGames = this.playerGameList.filter((x) => x.PlayerId === p.PlayerId);
    });

    this.gameList.forEach((x) => x.calculateFields());
    this.playerGameList.forEach((x) => x.calculateFields());
    this.boardGameList.forEach((x) => x.calculateFields());
    this.playerList.forEach((x) => x.calculateFields());

    this.stats = new StatsModel(this.playerList, this.gameList, this.boardGameList);
  }
}
