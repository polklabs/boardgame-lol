import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';
import { BehaviorSubject } from 'rxjs';
import {
  BoardGameEntity,
  BoardGameReturn,
  ClubEntity,
  ConvertListToDict,
  GameEntity,
  GameReturn,
  GameWrapper,
  PlayerEntity,
  PlayerGameEntity,
  PlayerReturn,
  TagBoardGameEntity,
  TagEntity,
} from 'libs/index';
import { format } from 'date-fns';
import { TagGameEntity } from 'libs/models/TagGame.entity';
import { TagPlayerEntity } from 'libs/models/TagPlayer.entity';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private httpService = inject(HttpService);

  // Instance Observables
  readonly dataUpdate$ = new BehaviorSubject<void>(undefined);
  readonly publicClubs$ = new BehaviorSubject<ClubEntity[]>([]);
  readonly club$ = new BehaviorSubject<ClubEntity | undefined>(undefined);
  readonly boardGameList$ = new BehaviorSubject<BoardGameEntity[]>([]);
  readonly playerGameList$ = new BehaviorSubject<PlayerGameEntity[]>([]);
  readonly playerList$ = new BehaviorSubject<PlayerEntity[]>([]);
  readonly gameList$ = new BehaviorSubject<GameEntity[]>([]);
  readonly tagList$ = new BehaviorSubject<TagEntity[]>([]);
  readonly tagBoardGameList$ = new BehaviorSubject<TagBoardGameEntity[]>([]);
  readonly tagGameList$ = new BehaviorSubject<TagGameEntity[]>([]);
  readonly tagPlayerList$ = new BehaviorSubject<TagPlayerEntity[]>([]);

  // Maps
  private _boardGameDict: Record<string, BoardGameEntity> = {};
  private _playerDict: Record<string, PlayerEntity> = {};
  private _gameDict: Record<string, GameEntity> = {};
  private _playerGameDict: Record<string, PlayerGameEntity> = {};
  private _tagDict: Record<string, TagEntity> = {};

  // Filters
  private _filteredBoardGameIds = new Set<string>();
  private _filteredPlayerIds = new Set<string>();
  private _filteredDaysOfWeek = new Set<string>();
  private _filteredStartDate: Date | null = null;
  private _includeDNF = true; // Did not finish

  // Filtered Observables
  readonly filteredBoardGameList$ = new BehaviorSubject<BoardGameEntity[]>([]);
  readonly filteredPlayerList$ = new BehaviorSubject<PlayerEntity[]>([]);
  readonly filteredGameList$ = new BehaviorSubject<GameEntity[]>([]);
  readonly filteredPlayerGameList$ = new BehaviorSubject<PlayerGameEntity[]>([]);
  readonly filterEnabled$ = new BehaviorSubject<boolean>(false);

  // Club
  get club() {
    return this.club$.value;
  }
  get clubId() {
    return this.club?.ClubId;
  }
  private set club(club: ClubEntity | undefined) {
    this.club$.next(new ClubEntity(club, true));
  }

  // Board Games
  get boardGameList() {
    return this.filteredBoardGameList$.value;
  }
  getBoardGame(key: string | null): BoardGameEntity | null {
    return this.getFromDict(key, this._boardGameDict);
  }
  private set boardGameList(boardGameList: BoardGameEntity[]) {
    boardGameList = boardGameList.map((x) => new BoardGameEntity(x));
    this._boardGameDict = ConvertListToDict(boardGameList, BoardGameEntity);
    this.boardGameList$.next(boardGameList);
  }
  private set fBoardGameList(boardGameList: BoardGameEntity[]) {
    this.filteredBoardGameList$.next(boardGameList);
  }

  // Players
  get playerList() {
    return this.filteredPlayerList$.value;
  }
  getPlayer(key: string | null): PlayerEntity | null {
    return this.getFromDict(key, this._playerDict);
  }
  private set playerList(playerList: PlayerEntity[]) {
    playerList = playerList.map((x) => new PlayerEntity(x));
    this._playerDict = ConvertListToDict(playerList, PlayerEntity);
    this.playerList$.next(playerList);
  }
  private set fPlayerList(playerList: PlayerEntity[]) {
    this.filteredPlayerList$.next(playerList);
  }

  // Games
  get gameList() {
    return this.filteredGameList$.value;
  }
  getGame(key: string | null): GameEntity | null {
    return this.getFromDict(key, this._gameDict);
  }
  private set gameList(gameList: GameEntity[]) {
    gameList = gameList.map((x) => new GameEntity(x));
    this._gameDict = ConvertListToDict(gameList, GameEntity);
    this.gameList$.next(gameList);
  }
  private set fGameList(gameList: GameEntity[]) {
    this.filteredGameList$.next(gameList);
  }

  // Player Games
  get playerGameList() {
    return this.filteredPlayerGameList$.value;
  }
  getPlayerGame(key: string | null): PlayerGameEntity | null {
    return this.getFromDict(key, this._playerGameDict);
  }
  private set playerGameList(playerGameList: PlayerGameEntity[]) {
    playerGameList = playerGameList.map((x) => new PlayerGameEntity(x));
    this._playerGameDict = ConvertListToDict(playerGameList, PlayerGameEntity);
    this.playerGameList$.next(playerGameList);
  }
  private set fPlayerGameList(playerGameList: PlayerGameEntity[]) {
    this.filteredPlayerGameList$.next(playerGameList);
  }

  // Tags
  get tagList() {
    return this.tagList$.value;
  }
  getTag(key: string | null): TagEntity | null {
    return this.getFromDict(key, this._tagDict);
  }
  private set tagList(tagList: TagEntity[]) {
    tagList = tagList.map((x) => new TagEntity(x));
    this._tagDict = ConvertListToDict(tagList, TagEntity);
    this.tagList$.next(tagList);
  }

  // Tag Board Games
  get tagBoardGameList() {
    return this.tagBoardGameList$.value;
  }
  private set tagBoardGameList(tagBoardGameList: TagBoardGameEntity[]) {
    tagBoardGameList = tagBoardGameList.map((x) => new TagBoardGameEntity(x));
    this.tagBoardGameList$.next(tagBoardGameList);
  }

  // Tag Games
  get tagGameList() {
    return this.tagGameList$.value;
  }
  private set tagGameList(tagGameList: TagGameEntity[]) {
    tagGameList = tagGameList.map((x) => new TagGameEntity(x));
    this.tagGameList$.next(tagGameList);
  }

  // Tag Players
  get tagPlayerList() {
    return this.tagPlayerList$.value;
  }
  private set tagPlayerList(tagPlayerList: TagPlayerEntity[]) {
    tagPlayerList = tagPlayerList.map((x) => new TagPlayerEntity(x));
    this.tagPlayerList$.next(tagPlayerList);
  }

  // Public Clubs
  get publicClubs() {
    return this.publicClubs$.value;
  }
  private set publicClubs(publicClubs: ClubEntity[]) {
    publicClubs = publicClubs.map((x) => new ClubEntity(x, true));
    this.publicClubs$.next(publicClubs);
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
    this.tagList = [];
    this.tagBoardGameList = [];
    this.tagGameList = [];
    this.tagPlayerList = [];
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
      Tags: TagEntity[];
      TagBoardGames: TagBoardGameEntity[];
      TagGames: TagGameEntity[];
      TagPlayers: TagPlayerEntity[];
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
    this.tagList = data.Tags;
    this.tagBoardGameList = data.TagBoardGames;
    this.tagGameList = data.TagGames;
    this.tagPlayerList = data.TagPlayers;
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
      this.publicClubs = [...this.publicClubs, result];
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
      this.gameList = this.upsertEntry(result.Game, (x) => x.GameId, this.gameList$.value, this._gameDict);

      result.PlayerGames.forEach((pg) => {
        this.playerGameList = this.upsertEntry(
          pg,
          (x) => x.PlayerGameId,
          this.playerGameList$.value,
          this._playerGameDict,
        );
      });
      this.boardGameList = result.BoardGames;
      this.playerList = result.Players;
      this.tagBoardGameList = result.TagBoardGames;
      this.tagGameList = result.TagGames;
      this.tagPlayerList = result.TagPlayers;
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async postPlayer(isNew: boolean, entity: PlayerEntity) {
    let result: PlayerReturn | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'player'], entity);
    } else {
      result = await this.httpService.patch(['api', 'player'], entity);
    }

    if (result) {
      this.playerList = this.upsertEntry(result.Player, (x) => x.PlayerId, this.playerList$.value, this._playerDict);
      this.tagList = result.Tags;
      this.tagPlayerList = result.TagPlayers;
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async postBoardGame(isNew: boolean, entity: BoardGameEntity) {
    let result: BoardGameReturn | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'board-game'], entity);
    } else {
      result = await this.httpService.patch(['api', 'board-game'], entity);
    }

    if (result) {
      this.boardGameList = this.upsertEntry(
        result.BoardGame,
        (x) => x.BoardGameId,
        this.boardGameList$.value,
        this._boardGameDict,
      );
      this.tagList = result.Tags;
      this.tagBoardGameList = result.TagBoardGames;
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deleteGame(gameId: string) {
    if (gameId === '') {
      console.log('gameId is empty');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'game', this.clubId, gameId]);

    if (result) {
      this.gameList = this.gameList$.value.filter((x) => x.GameId !== gameId);
      this.playerGameList = this.playerGameList$.value.filter((x) => x.GameId !== gameId);
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
        this.gameList = this.upsertEntry(g, (x) => x.GameId, this.gameList$.value, this._gameDict);
      });
      this.gameList = [...this.gameList$.value];
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deletePlayer(playerId: string) {
    if (playerId === '') {
      console.log('playerId is empty');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'player', this.clubId, playerId]);

    if (result) {
      this.playerList = this.playerList$.value.filter((x) => x.PlayerId !== playerId);
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deleteBoardGame(boardGameId: string) {
    if (boardGameId === '') {
      console.log('boardGameId is empty');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'board-game', this.clubId, boardGameId]);

    if (result) {
      this.boardGameList = this.boardGameList$.value.filter((x) => x.BoardGameId !== boardGameId);
      this.gameList = this.gameList$.value.filter((x) => x.BoardGameId !== boardGameId);
      this.playerGameList = this.playerGameList$.value.filter((x) => x.Game?.BoardGameId !== boardGameId);
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deleteClub(clubId: string) {
    if (clubId === '') {
      console.log('clubId is empty');
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

  filter(enabled: boolean, playerIds: string[], boardGameIds: string[], daysOfWeek: string[], startDate: Date | null) {
    this._filteredBoardGameIds = new Set(boardGameIds);
    this._filteredPlayerIds = new Set(playerIds);
    this._filteredDaysOfWeek = new Set(daysOfWeek);
    this._filteredStartDate = startDate;
    this.filterEnabled$.next(enabled);
    this.updateReferences();
    this.dataUpdate$.next();
  }

  private updateReferences() {
    // Filter lists
    if (this.filterEnabled$.value) {
      this.fGameList = this.gameList$.value.filter((x) => {
        return (
          this._filteredBoardGameIds.has(x.BoardGameId) &&
          this._filteredDaysOfWeek.has(format(x.DateObj, 'cccc')) &&
          (this._filteredStartDate === null || new Date(x.DateObj).getTime() >= this._filteredStartDate.getTime())
        );
      });
      this.fBoardGameList = this.boardGameList$.value.filter((x) => this._filteredBoardGameIds.has(x.BoardGameId));
      this.fPlayerGameList = this.playerGameList$.value.filter((x) => this._filteredPlayerIds.has(x.PlayerId));
      this.fPlayerList = this.playerList$.value.filter((x) => this._filteredPlayerIds.has(x.PlayerId));
    } else {
      this.fGameList = this.gameList$.value;
      this.fBoardGameList = this.boardGameList$.value;
      this.fPlayerGameList = this.playerGameList$.value;
      this.fPlayerList = this.playerList$.value;
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
      game.Tags = this.tagGameList
        .filter((x) => x.GameId === game.GameId)
        .map((t) => this.getTag(t.TagId))
        .filter((x) => x !== null);
    });

    this.playerGameList.forEach((pg) => {
      pg.Player = this.getPlayer(pg.PlayerId);
      pg.Game = this.getGame(pg.GameId);
    });

    this.boardGameList.forEach((bg) => {
      bg.Games = this.gameList.filter((x) => x.BoardGameId === bg.BoardGameId);
      bg.Tags = this.tagBoardGameList
        .filter((x) => x.BoardGameId === bg.BoardGameId)
        .map((t) => this.getTag(t.TagId))
        .filter((x) => x !== null);
    });

    this.playerList.forEach((p) => {
      p.PlayerGames = this.playerGameList.filter((x) => x.PlayerId === p.PlayerId);
      p.Tags = this.tagPlayerList
        .filter((x) => x.PlayerId === p.PlayerId)
        .map((t) => this.getTag(t.TagId))
        .filter((x) => x !== null);
    });

    this.tagBoardGameList.forEach((t) => {
      t.Tag = this.getTag(t.TagId);
    });

    this.tagGameList.forEach((t) => {
      t.Tag = this.getTag(t.TagId);
    });

    this.tagPlayerList.forEach((t) => {
      t.Tag = this.getTag(t.TagId);
    });

    this.calculatedFields();
  }

  private calculatedFields() {
    this.club?.resetCalculated(new ClubEntity(), ClubEntity);
    this.publicClubs.forEach((x) => x.resetCalculated(new ClubEntity(), ClubEntity));
    this.gameList.forEach((x) => x.resetCalculated(new GameEntity(), GameEntity));
    this.playerGameList.forEach((x) => x.resetCalculated(new PlayerGameEntity(), PlayerGameEntity));
    this.boardGameList.forEach((x) => x.resetCalculated(new BoardGameEntity(), BoardGameEntity));
    this.playerList.forEach((x) => x.resetCalculated(new PlayerEntity(), PlayerEntity));

    this.club?.calculate();
    this.publicClubs.forEach((x) => x.calculate());
    this.gameList.forEach((x) => x.calculate());
    this.playerGameList.forEach((x) => x.calculate());
    this.boardGameList.forEach((x) => x.calculate());
    this.playerList.forEach((x) => x.calculate());

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

  private getFromDict<T>(key: string | null, dict: Record<string, T>): T | null {
    if (key && key in dict) {
      return dict[key];
    } else {
      return null;
    }
  }
}
