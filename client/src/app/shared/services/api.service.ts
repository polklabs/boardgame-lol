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
import { format } from 'date-fns';

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

  // Filters
  private _filterEnabled = false;
  private _filteredBoardGameIds = new Set<string>();
  private _filteredPlayerIds = new Set<string>();
  private _filteredDaysOfWeek = new Set<string>();
  private _includeDNF = true; // Did not finish
  private _fBoardGameList: BoardGameEntity[] = [];
  private _fPlayerList: PlayerEntity[] = [];
  private _fGameList: GameEntity[] = [];
  private _fPlayerGameList: PlayerGameEntity[] = [];

  // Observables
  readonly dataUpdate$ = new BehaviorSubject<void>(undefined);
  readonly publicClubs$ = new BehaviorSubject<typeof this._publicClubs>([]);
  readonly club$ = new BehaviorSubject<typeof this._club>(undefined);
  readonly boardGameList$ = new BehaviorSubject<typeof this._boardGameList>([]);
  readonly playerList$ = new BehaviorSubject<typeof this._playerList>([]);
  readonly stats$ = new BehaviorSubject<typeof this._stats>(undefined);
  readonly filteredBoardGameList$ = new BehaviorSubject<typeof this._fBoardGameList>([]);
  readonly filteredPlayerList$ = new BehaviorSubject<typeof this._fPlayerList>([]);
  readonly filteredGameList$ = new BehaviorSubject<typeof this._fGameList>([]);
  readonly filteredPlayerGameList$ = new BehaviorSubject<typeof this._fPlayerGameList>([]);
  readonly filterEnabled$ = new BehaviorSubject<boolean>(false);

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
    return this._fBoardGameList;
  }
  private set boardGameList(boardGameList: BoardGameEntity[]) {
    this._fBoardGameList = boardGameList.map((x) => new BoardGameEntity(x, true));
    this.filteredBoardGameList$.next(this._fBoardGameList);
    this.boardGameList$.next(this._boardGameList);
  }

  // Players
  get playerList() {
    return this._fPlayerList;
  }
  private set playerList(playerList: PlayerEntity[]) {
    this._fPlayerList = playerList.map((x) => new PlayerEntity(x, true));
    this.filteredPlayerList$.next(this._fPlayerList);
    this.playerList$.next(this._playerList);
  }

  // Games
  get gameList() {
    return this._fGameList;
  }
  private set gameList(gameList: GameEntity[]) {
    this._fGameList = gameList.map((x) => new GameEntity(x, true));
    this.filteredGameList$.next(this._fGameList);
  }

  // Player Games
  get playerGameList() {
    return this._fPlayerGameList;
  }
  private set playerGameList(playerGameList: PlayerGameEntity[]) {
    this._fPlayerGameList = playerGameList.map((x) => new PlayerGameEntity(x, true));
    this.filteredPlayerGameList$.next(this._fPlayerGameList);
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
    this._boardGameList = [];
    this._playerList = [];
    this._gameList = [];
    this._playerGameList = [];
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
    this._boardGameList = data.BoardGames;
    this._playerList = data.Players;
    data.Games.sort((a, b) => (a.LastModifiedDate ?? '')?.localeCompare(b.LastModifiedDate ?? ''));
    this._gameList = data.Games;
    this._playerGameList = data.PlayerGames;
    this.updateReferences();
    this.dataUpdate$.next();
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
      const gameIndex = this._gameList.findIndex((x) => x.GameId === result?.Game.GameId);
      if (gameIndex >= 0) {
        this._gameList[gameIndex] = result.Game;
      } else {
        this._gameList = [...this._gameList, result.Game];
      }

      result.PlayerGames.forEach((pg) => {
        const pgIndex = this._playerGameList.findIndex((x) => x.PlayerGameId === pg.PlayerGameId);
        if (pgIndex >= 0) {
          this._playerGameList[pgIndex] = pg;
        } else {
          this._playerGameList = [...this._playerGameList, pg];
        }
      });
      this._boardGameList = result.BoardGames;
      this._playerList = result.Players;
      this.updateReferences();
      this.dataUpdate$.next();
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
      const index = this._playerList.findIndex((x) => x.PlayerId === result?.PlayerId);
      if (index >= 0) {
        this._playerList[index] = result;
      } else {
        this._playerList = [...this._playerList, result];
      }
      this.updateReferences();
      this.dataUpdate$.next();
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
      const index = this._boardGameList.findIndex((x) => x.BoardGameId === result?.BoardGameId);
      if (index >= 0) {
        this._boardGameList[index] = result;
      } else {
        this._boardGameList = [...this._boardGameList, result];
      }
      this.updateReferences();
      this.dataUpdate$.next();
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
      this._gameList = this._gameList.filter((x) => x.GameId !== gameId);
      this._playerGameList = this._playerGameList.filter((x) => x.GameId !== gameId);
      this.updateReferences();
      this.dataUpdate$.next();
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
        const index = this._gameList.findIndex((x) => x.GameId === g.GameId);
        if (index !== -1) {
          this._gameList[index] = g;
        } else {
          this._gameList.push(g);
        }
      });
      this._gameList = [...this._gameList];
      this.updateReferences();
      this.dataUpdate$.next();
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
      this._playerList = this._playerList.filter((x) => x.PlayerId !== playerId);
      this.updateReferences();
      this.dataUpdate$.next();
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
      this._boardGameList = this._boardGameList.filter((x) => x.BoardGameId !== boardGameId);
      this.updateReferences();
      this.dataUpdate$.next();
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

  filter(enabled: boolean, playerIds: string[], boardGameIds: string[], daysOfWeek: string[], dnf: boolean) {
    this._filteredBoardGameIds = new Set(boardGameIds);
    this._filteredPlayerIds = new Set(playerIds);
    this._filteredDaysOfWeek = new Set(daysOfWeek);
    this._includeDNF = dnf;
    this._filterEnabled = enabled;
    this.filterEnabled$.next(enabled);
    this.updateReferences();
  }

  private updateReferences() {
    // Filter lists
    if (this._filterEnabled) {
      this.gameList = this._gameList.filter((x) => {
        return (
          this._filteredBoardGameIds.has(x.BoardGameId ?? '') &&
          this._filteredDaysOfWeek.has(format(x.DateObj, 'cccc')) &&
          (this._includeDNF ? true : x.DidNotFinish === false)
        );
      });
      this.boardGameList = this._boardGameList.filter((x) => this._filteredBoardGameIds.has(x.BoardGameId ?? ''));
      this.playerGameList = this._playerGameList.filter((x) => this._filteredPlayerIds.has(x.PlayerId ?? ''));
      this.playerList = this._playerList.filter((x) => this._filteredPlayerIds.has(x.PlayerId ?? ''));
    } else {
      this.gameList = this._gameList;
      this.boardGameList = this._boardGameList;
      this.playerGameList = this._playerGameList;
      this.playerList = this._playerList;
    }

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
              return (a.Points ?? Infinity) - (b.Points ?? Infinity);
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
