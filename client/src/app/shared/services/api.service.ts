import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';
import { BehaviorSubject } from 'rxjs';
import {
  BoardGameEntity,
  ClubEntity,
  ConvertListToDict,
  GameEntity,
  GameReturn,
  GameWrapper,
  PlayerEntity,
  PlayerGameEntity,
} from 'libs/index';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private httpService = inject(HttpService);

  // Instances
  private _publicClubs: ClubEntity[] = [];
  private _club?: ClubEntity;
  private _boardGameListFull: BoardGameEntity[] = [];
  private _playerListFull: PlayerEntity[] = [];
  private _gameListFull: GameEntity[] = [];
  private _playerGameListFull: PlayerGameEntity[] = [];

  // Maps
  private _boardGameDict: Record<string, BoardGameEntity> = {};
  private _playerDict: Record<string, PlayerEntity> = {};
  private _gameDict: Record<string, GameEntity> = {};
  private _playerGameDict: Record<string, PlayerGameEntity> = {};

  // Filters
  private _filterEnabled = false;
  private _filteredBoardGameIds = new Set<string>();
  private _filteredPlayerIds = new Set<string>();
  private _filteredDaysOfWeek = new Set<string>();
  private _filteredStartDate: Date | null = null;
  private _includeDNF = true; // Did not finish
  private _fBoardGameList: BoardGameEntity[] = [];
  private _fPlayerList: PlayerEntity[] = [];
  private _fGameList: GameEntity[] = [];
  private _fPlayerGameList: PlayerGameEntity[] = [];

  // Observables
  readonly dataUpdate$ = new BehaviorSubject<void>(undefined);
  readonly publicClubs$ = new BehaviorSubject<typeof this._publicClubs>([]);
  readonly club$ = new BehaviorSubject<typeof this._club>(undefined);
  readonly boardGameList$ = new BehaviorSubject<typeof this._boardGameListFull>([]);
  readonly playerList$ = new BehaviorSubject<typeof this._playerListFull>([]);
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

  // Board Games
  get boardGameList() {
    return this._fBoardGameList;
  }
  getBoardGame(key: string): BoardGameEntity | undefined {
    return this._boardGameDict[key];
  }
  private set boardGameList(boardGameList: BoardGameEntity[]) {
    this._boardGameListFull = boardGameList.map((x) => new BoardGameEntity(x));
    this._boardGameDict = ConvertListToDict(this._boardGameListFull, BoardGameEntity);
    this.boardGameList$.next(this._boardGameListFull);
  }
  private set fBoardGameList(boardGameList: BoardGameEntity[]) {
    this._fBoardGameList = boardGameList;
    this.filteredBoardGameList$.next(this._fBoardGameList);
  }

  // Players
  get playerList() {
    return this._fPlayerList;
  }
  getPlayer(key: string): PlayerEntity | undefined {
    return this._playerDict[key];
  }
  private set playerList(playerList: PlayerEntity[]) {
    this._playerListFull = playerList.map((x) => new PlayerEntity(x));
    this._playerDict = ConvertListToDict(this._playerListFull, PlayerEntity);
    this.playerList$.next(this._playerListFull);
  }
  private set fPlayerList(playerList: PlayerEntity[]) {
    this._fPlayerList = playerList;
    this.filteredPlayerList$.next(this._fPlayerList);
  }

  // Games
  get gameList() {
    return this._fGameList;
  }
  getGame(key: string): GameEntity | undefined {
    return this._gameDict[key];
  }
  private set gameList(gameList: GameEntity[]) {
    this._gameListFull = gameList.map((x) => new GameEntity(x));
    this._gameDict = ConvertListToDict(this._gameListFull, GameEntity);
  }
  private set fGameList(gameList: GameEntity[]) {
    this._fGameList = gameList;
    this.filteredGameList$.next(this._fGameList);
  }

  // Player Games
  get playerGameList() {
    return this._fPlayerGameList;
  }
  getPlayerGame(key: string): PlayerGameEntity | undefined {
    return this._playerGameDict[key];
  }
  private set playerGameList(playerGameList: PlayerGameEntity[]) {
    this._playerGameListFull = playerGameList.map((x) => new PlayerGameEntity(x));
    this._playerGameDict = ConvertListToDict(this._playerGameListFull, PlayerGameEntity);
  }
  private set fPlayerGameList(playerGameList: PlayerGameEntity[]) {
    this._fPlayerGameList = playerGameList;
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

  unloadClub() {
    this.club = undefined;
    this.boardGameList = [];
    this.fBoardGameList = [];
    this.playerList = [];
    this.fPlayerList = [];
    this.gameList = [];
    this.fGameList = [];
    this.playerGameList = [];
    this.fPlayerGameList = [];
  }

  async fetchPublicClubs() {
    const data = await this.httpService.get<ClubEntity[]>(['api', 'clubs']);

    if (data) {
      // continue
    } else {
      return;
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

    if (data?.Club) {
      // continue
    } else {
      return;
    }

    this.club = data.Club;
    this.boardGameList = data.BoardGames;
    this.playerList = data.Players;
    data.Games.sort((a, b) => (a.LastModifiedDate ?? '')?.localeCompare(b.LastModifiedDate ?? ''));
    this.gameList = data.Games;
    this.playerGameList = data.PlayerGames;
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
      this.gameList = this.upsertEntry(result.Game, (x) => x.GameId, this._gameListFull, this._gameDict);

      result.PlayerGames.forEach((pg) => {
        this.playerGameList = this.upsertEntry(
          pg,
          (x) => x.PlayerGameId,
          this._playerGameListFull,
          this._playerGameDict,
        );
      });
      this.boardGameList = result.BoardGames;
      this.playerList = result.Players;
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
      this.playerList = this.upsertEntry(result, (x) => x.PlayerId, this._playerListFull, this._playerDict);
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
      this.boardGameList = this.upsertEntry(result, (x) => x.BoardGameId, this._boardGameListFull, this._boardGameDict);
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
      this.gameList = this._gameListFull.filter((x) => x.GameId !== gameId);
      this.playerGameList = this._playerGameListFull.filter((x) => x.GameId !== gameId);
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
        this.gameList = this.upsertEntry(g, (x) => x.GameId, this._gameListFull, this._gameDict);
      });
      this.gameList = [...this._gameListFull];
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
      this.playerList = this._playerListFull.filter((x) => x.PlayerId !== playerId);
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
      this.boardGameList = this._boardGameListFull.filter((x) => x.BoardGameId !== boardGameId);
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

  filter(
    enabled: boolean,
    playerIds: string[],
    boardGameIds: string[],
    daysOfWeek: string[],
    startDate: Date | null,
    dnf: boolean,
  ) {
    this._filteredBoardGameIds = new Set(boardGameIds);
    this._filteredPlayerIds = new Set(playerIds);
    this._filteredDaysOfWeek = new Set(daysOfWeek);
    this._filteredStartDate = startDate;
    this._includeDNF = dnf;
    this._filterEnabled = enabled;
    this.filterEnabled$.next(enabled);
    this.updateReferences();
    this.dataUpdate$.next();
  }

  private updateReferences() {
    // Filter lists
    if (this._filterEnabled) {
      this.fGameList = this._gameListFull.filter((x) => {
        return (
          this._filteredBoardGameIds.has(x.BoardGameId ?? '') &&
          this._filteredDaysOfWeek.has(format(x.DateObj, 'cccc')) &&
          (this._filteredStartDate === null || new Date(x.DateObj).getTime() >= this._filteredStartDate.getTime()) &&
          (this._includeDNF ? true : x.DidNotFinish === false)
        );
      });
      this.fBoardGameList = this._boardGameListFull.filter((x) => this._filteredBoardGameIds.has(x.BoardGameId ?? ''));
      this.fPlayerGameList = this._playerGameListFull.filter((x) => this._filteredPlayerIds.has(x.PlayerId ?? ''));
      this.fPlayerList = this._playerListFull.filter((x) => this._filteredPlayerIds.has(x.PlayerId ?? ''));
    } else {
      this.fGameList = this._gameListFull;
      this.fBoardGameList = this._boardGameListFull;
      this.fPlayerGameList = this._playerGameListFull;
      this.fPlayerList = this._playerListFull;
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
    PlayerEntity.postCalculate(this.playerList);
    GameEntity.postCalculate(this.gameList);
  }

  private upsertEntry<T>(item: T, key: (item: T) => string | null, list: T[], dict: Record<string, T>): T[] {
    dict[key(item) ?? ''] = item;
    const pgIndex = list.findIndex((x) => key(x) === key(item));
    if (pgIndex >= 0) {
      list[pgIndex] = item;
      return list;
    } else {
      return [...list, item];
    }
  }
}
