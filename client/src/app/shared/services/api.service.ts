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
  PlayerEntity,
  PlayerGameEntity,
  PlayerReturn,
  TagBoardGameEntity,
  TagPlayerGameEntity,
  TagEntity,
  ClubReturn,
} from 'libs/index';
import { TagGameEntity } from 'libs/models/TagGame.entity';
import { TagPlayerEntity } from 'libs/models/TagPlayer.entity';
import { PlayerGamePlayerEntity } from 'libs/models/PlayerGamePlayer.entity';
import { FilterModel } from '../models/filter.mode';

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
  readonly playerGamePlayerList$ = new BehaviorSubject<PlayerGamePlayerEntity[]>([]);
  readonly playerList$ = new BehaviorSubject<PlayerEntity[]>([]);
  readonly gameList$ = new BehaviorSubject<GameEntity[]>([]);
  readonly tagList$ = new BehaviorSubject<TagEntity[]>([]);
  readonly tagBoardGameList$ = new BehaviorSubject<TagBoardGameEntity[]>([]);
  readonly tagGameList$ = new BehaviorSubject<TagGameEntity[]>([]);
  readonly tagPlayerList$ = new BehaviorSubject<TagPlayerEntity[]>([]);
  readonly tagPlayerGameList$ = new BehaviorSubject<TagPlayerGameEntity[]>([]);

  // Maps
  private _boardGameDict: Record<string, BoardGameEntity> = {};
  private _playerDict: Record<string, PlayerEntity> = {};
  private _gameDict: Record<string, GameEntity> = {};
  private _tagDict: Record<string, TagEntity> = {};

  private filters = new FilterModel({});

  // Filtered Observables
  readonly filteredBoardGameList$ = new BehaviorSubject<BoardGameEntity[]>([]);
  readonly filteredPlayerList$ = new BehaviorSubject<PlayerEntity[]>([]);
  readonly filteredGameList$ = new BehaviorSubject<GameEntity[]>([]);
  readonly filteredPlayerGameList$ = new BehaviorSubject<PlayerGameEntity[]>([]);
  readonly filteredPlayerGamePlayerList$ = new BehaviorSubject<PlayerGamePlayerEntity[]>([]);
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
  private set playerGameList(playerGameList: PlayerGameEntity[]) {
    playerGameList = playerGameList.map((x) => new PlayerGameEntity(x));
    this.playerGameList$.next(playerGameList);
  }
  private set fPlayerGameList(playerGameList: PlayerGameEntity[]) {
    this.filteredPlayerGameList$.next(playerGameList);
  }

  // Player Game Players
  get playerGamePlayerList() {
    return this.filteredPlayerGamePlayerList$.value;
  }
  private set playerGamePlayerList(playerGamePlayerList: PlayerGamePlayerEntity[]) {
    playerGamePlayerList = playerGamePlayerList.map((x) => new PlayerGamePlayerEntity(x));
    this.playerGamePlayerList$.next(playerGamePlayerList);
  }
  private set fPlayerGamePlayerList(playerGamePlayerList: PlayerGamePlayerEntity[]) {
    this.filteredPlayerGamePlayerList$.next(playerGamePlayerList);
  }

  // Tags
  get tagList() {
    return this.tagList$.value;
  }
  getTag(key: string | null): TagEntity | null {
    return this.getFromDict(key, this._tagDict);
  }
  private set tagList(tagList: TagEntity[]) {
    tagList = tagList.map((x) => new TagEntity(x)).toSorted((a, b) => a.Text.localeCompare(b.Text));
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

  // Tag Player Games
  get tagPlayerGameList() {
    return this.tagPlayerGameList$.value;
  }
  private set tagPlayerGameList(tagPlayerGameList: TagPlayerGameEntity[]) {
    tagPlayerGameList = tagPlayerGameList.map((x) => new TagPlayerGameEntity(x));
    this.tagPlayerGameList$.next(tagPlayerGameList);
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
    this.playerGamePlayerList = [];
    this.fGameList = [];
    this.tagList = [];
    this.tagBoardGameList = [];
    this.tagGameList = [];
    this.tagPlayerList = [];
    this.tagPlayerGameList = [];
  }

  async fetchPublicClubs() {
    const data = await this.httpService.get<ClubEntity[]>(['api', 'clubs']);

    if (data) {
      // continue
    } else {
      return;
    }

    this.publicClubs = data;
    this.calculatedFields();
  }

  async fetchClub(clubId: string) {
    if (this.clubId === clubId) {
      console.log('Club already fetched');
      return;
    } else {
      // continue
    }

    this.unloadClub();

    const data = await this.httpService.get<ClubReturn>(['api', 'club', clubId]);

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
    this.playerGamePlayerList = data.PlayerGamePlayers;
    this.tagList = data.Tags;
    this.tagBoardGameList = data.TagBoardGames;
    this.tagGameList = data.TagGames;
    this.tagPlayerList = data.TagPlayers;
    this.tagPlayerGameList = data.TagPlayerGames;
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
      this.publicClubs = this.upsertEntry(result, (x) => x.ClubId, this.publicClubs);
      this.updateReferences();
      return true;
    } else {
      return false;
    }
  }

  async postGame(isNew: boolean, data: GameEntity): Promise<GameEntity | null> {
    let result: GameReturn | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'game'], data);
    } else {
      result = await this.httpService.patch(['api', 'game'], data);
    }

    if (result) {
      this.gameList = this.upsertEntry(result.Game, (x) => x.GameId, this.gameList$.value, this._gameDict);

      this.playerGameList = this.upsertEntry(
        result.PlayerGames,
        (x) => x.PlayerGameId,
        this.playerGameList$.value.filter((x) => x.GameId !== result.Game.GameId),
      );

      this.playerGamePlayerList = this.upsertEntry(
        result.PlayerGamePlayers,
        (x) => `${x.PlayerGameId};${x.PlayerId}`,
        this.playerGamePlayerList$.value.filter((x) => x.GameId !== result.Game.GameId),
      );

      this.tagGameList = this.upsertEntry(
        result.TagGames,
        (x) => `${x.GameId};${x.TagId}`,
        this.tagGameList$.value.filter((x) => x.GameId !== result.Game.GameId),
      );

      const playerGameIds = new Set(result.PlayerGames.map((x) => x.PlayerGameId));
      this.tagPlayerGameList = this.upsertEntry(
        result.TagPlayerGames,
        (x) => `${x.PlayerGameId};${x.TagId}`,
        this.tagPlayerGameList$.value.filter((x) => !playerGameIds.has(x.PlayerGameId)),
      );
      this.updateReferences();
      this.dataUpdate$.next();
      return this.getGame(result.Game.GameId);
    } else {
      return null;
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

      this.tagPlayerList = this.upsertEntry(
        result.TagPlayers,
        (x) => `${x.PlayerId};${x.TagId}`,
        this.tagPlayerList$.value.filter((x) => x.PlayerId !== result.Player.PlayerId),
      );

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

      this.tagBoardGameList = this.upsertEntry(
        result.TagBoardGames,
        (x) => `${x.BoardGameId};${x.TagId}`,
        this.tagBoardGameList$.value.filter((x) => x.BoardGameId !== result.BoardGame.BoardGameId),
      );

      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async postTag(isNew: boolean, entity: TagEntity) {
    let result: TagEntity | null = null;
    if (isNew) {
      result = await this.httpService.put(['api', 'tag'], entity);
    } else {
      result = await this.httpService.patch(['api', 'tag'], entity);
    }

    if (result) {
      this.tagList = this.upsertEntry(result, (x) => x.TagId, this.tagList, this._tagDict);
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
      this.gameList = this.upsertEntry(result, (x) => x.GameId, this.gameList$.value, this._gameDict);
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

  async deleteTag(tagId: string) {
    if (tagId === '') {
      console.log('tagId is empty');
      return false;
    } else {
      // continue
    }

    const result = await this.httpService.delete(['api', 'tag', this.clubId, tagId]);

    if (result) {
      this.tagList = this.tagList.filter((x) => x.TagId !== tagId);
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

  filter(filter: Partial<FilterModel>) {
    this.filters.assign(filter);
    this.filterEnabled$.next(this.filters.enabled);
    this.updateReferences();
    this.dataUpdate$.next();
  }

  private updateReferences() {
    // Filter lists
    if (this.filterEnabled$.value) {
      this.fGameList = this.gameList$.value.filter((x) => {
        return (
          this.filters.includeBoardGame(x) &&
          this.filters.includeDayOfWeek(x.DateObj) &&
          this.filters.includeExcludedTag(x.Tags) &&
          this.filters.includeEndDate(x.DateObj) &&
          this.filters.includeStartDate(x.DateObj)
        );
      });
      this.fBoardGameList = this.boardGameList$.value.filter(
        (x) => this.filters.includeBoardGame(x) && this.filters.includeExcludedTag(x.Tags),
      );
      this.fPlayerGamePlayerList = this.playerGamePlayerList$.value.filter((x) => this.filters.includePlayer(x));
      this.fPlayerGameList = this.playerGameList$.value.filter(
        (x) =>
          this.filteredPlayerGamePlayerList$.value.some((pgp) => pgp.PlayerGameId === x.PlayerGameId) &&
          this.filters.includeBoardGame(x.Game) &&
          this.filters.includeStartDate(x.Game?.DateObj) &&
          this.filters.includeEndDate(x.Game?.DateObj) &&
          this.filters.includeExcludedTag(x.Tags),
      );
      this.fPlayerList = this.playerList$.value.filter(
        (x) => this.filters.includePlayer(x) && this.filters.includeExcludedTag(x.Tags),
      );
    } else {
      this.fGameList = this.gameList$.value;
      this.fBoardGameList = this.boardGameList$.value;
      this.fPlayerGameList = this.playerGameList$.value;
      this.fPlayerGamePlayerList = this.playerGamePlayerList$.value;
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
            case 'points':
              return (b.VirtualPoints ?? 0) - (a.VirtualPoints ?? 0);
            case 'win-lose':
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
      pg.PlayerLinks = this.playerGamePlayerList.filter((x) => x.PlayerGameId === pg.PlayerGameId);
      pg.Players = pg.PlayerLinks.map((p) => this.getPlayer(p.PlayerId)).filter((x) => x !== null);
      pg.PlayerIds = new Set(pg.Players.map((x) => x.PlayerId));
      pg.Game = this.getGame(pg.GameId);
      pg.Tags = this.tagPlayerGameList
        .filter((x) => x.PlayerGameId === pg.PlayerGameId)
        .map((t) => this.getTag(t.TagId))
        .filter((x) => x !== null);
    });
    this.playerGameList.sort(
      (a, b) =>
        b.Game?.Date.toString().localeCompare(a.Game?.Date.toString() ?? '') ||
        (b.Game?.SortIndex ?? 0) - (a.Game?.SortIndex ?? 0),
    );

    this.boardGameList.forEach((bg) => {
      bg.Games = this.gameList.filter((x) => x.BoardGameId === bg.BoardGameId);
      bg.Tags = this.tagBoardGameList
        .filter((x) => x.BoardGameId === bg.BoardGameId)
        .map((t) => this.getTag(t.TagId))
        .filter((x) => x !== null);
    });

    this.playerList.forEach((p) => {
      p.PlayerGames = this.playerGameList.filter((x) => x.PlayerIds.has(p.PlayerId));
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

    this.tagPlayerGameList.forEach((t) => {
      t.Tag = this.getTag(t.TagId);
    });

    this.calculatedFields();
  }

  private calculatedFields() {
    this.club?.resetCalculated(ClubEntity);
    this.publicClubs.forEach((x) => x.resetCalculated(ClubEntity));
    this.gameList.forEach((x) => x.resetCalculated(GameEntity));
    this.playerGameList.forEach((x) => x.resetCalculated(PlayerGameEntity));
    this.playerGamePlayerList.forEach((x) => x.resetCalculated(PlayerGamePlayerEntity));
    this.boardGameList.forEach((x) => x.resetCalculated(BoardGameEntity));
    this.playerList.forEach((x) => x.resetCalculated(PlayerEntity));

    this.club?.calculate();
    this.publicClubs.forEach((x) => x.calculate());
    this.gameList.forEach((x) => x.calculate());
    this.playerGameList.forEach((x) => x.calculate());
    this.playerGamePlayerList.forEach((x) => x.calculate());
    this.boardGameList.forEach((x) => x.calculate());
    this.playerList.forEach((x) => x.calculate());
    this.tagList.forEach((x) => x.calculate());
    this.tagBoardGameList.forEach((x) => x.calculate());
    this.tagGameList.forEach((x) => x.calculate());
    this.tagPlayerList.forEach((x) => x.calculate());
    this.tagPlayerGameList.forEach((x) => x.calculate());

    PlayerEntity.postCalculate(this.playerList);
  }

  private upsertEntry<T>(items: T | T[], key: (item: T) => string | null, list: T[], dict?: Record<string, T>): T[] {
    items = Array.isArray(items) ? items : [items];

    for (const item of items) {
      if (dict) {
        dict[key(item) ?? ''] = item;
      } else {
        // Skip dictionary insert
      }
      const pgIndex = list.findIndex((x) => key(x) === key(item));
      if (pgIndex >= 0) {
        list[pgIndex] = item;
      } else {
        list = [...list, item];
      }
    }

    if (dict) {
      const keys = new Set(items.map(key));
      Object.keys(dict).forEach((k) => {
        if (keys.has(k)) {
          // Continue
        } else {
          delete dict[k];
        }
      });
    } else {
      // Skip
    }

    return list;
  }

  private getFromDict<T>(key: string | null, dict: Record<string, T>): T | null {
    if (key && key in dict) {
      return dict[key];
    } else {
      return null;
    }
  }
}
