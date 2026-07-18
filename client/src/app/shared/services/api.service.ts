import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';
import { BehaviorSubject } from 'rxjs';
import {
  BoardGameEntity,
  BoardGameReturn,
  ClubEntity,
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
import { EntityWrapper } from '../models/entity-wrapper';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private httpService = inject(HttpService);

  readonly clubs = new EntityWrapper(ClubEntity);
  readonly boardGames = new EntityWrapper(BoardGameEntity);
  readonly playerGames = new EntityWrapper(PlayerGameEntity);
  readonly playerGamePlayers = new EntityWrapper(PlayerGamePlayerEntity);
  readonly players = new EntityWrapper(PlayerEntity);
  readonly games = new EntityWrapper(GameEntity);
  readonly tags = new EntityWrapper(TagEntity);
  readonly tagBoardGames = new EntityWrapper(TagBoardGameEntity);
  readonly tagGames = new EntityWrapper(TagGameEntity);
  readonly tagPlayers = new EntityWrapper(TagPlayerEntity);
  readonly tagPlayerGames = new EntityWrapper(TagPlayerGameEntity);

  private entityWrappers = [
    this.clubs,
    this.games,
    this.boardGames,
    this.playerGames,
    this.playerGamePlayers,
    this.players,
    this.tags,
    this.tagBoardGames,
    this.tagGames,
    this.tagPlayers,
    this.tagPlayerGames,
  ];

  // Instance Observables
  readonly dataUpdate$ = new BehaviorSubject<void>(undefined);
  readonly club$ = new BehaviorSubject<ClubEntity | undefined>(undefined);

  private filters = new FilterModel({});
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

  unloadClub() {
    this.club = undefined;
    this.entityWrappers.forEach((w) => w.clear());
  }

  async fetchPublicClubs() {
    const data = await this.httpService.get<ClubEntity[]>(['api', 'clubs']);

    if (data) {
      // continue
    } else {
      return;
    }

    this.clubs.overwriteEntries(data);
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
    this.boardGames.overwriteEntries(data.BoardGames);
    this.games.overwriteEntries(data.Games);
    this.playerGames.overwriteEntries(data.PlayerGames);
    this.playerGamePlayers.overwriteEntries(data.PlayerGamePlayers);
    this.tags.overwriteEntries(data.Tags);
    this.tagBoardGames.overwriteEntries(data.TagBoardGames);
    this.tagGames.overwriteEntries(data.TagGames);
    this.tagPlayers.overwriteEntries(data.TagPlayers);
    this.tagPlayerGames.overwriteEntries(data.TagPlayerGames);
    this.players.overwriteEntries(data.Players);
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
      this.clubs.upsertEntry(result);
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
      this.games.upsertEntry(result.Game);

      this.playerGames.upsertEntry(result.PlayerGames, (x) => x.GameId === result.Game.GameId);
      this.playerGamePlayers.upsertEntry(result.PlayerGamePlayers, (x) => x.GameId === result.Game.GameId);
      this.tagGames.upsertEntry(result.TagGames, (x) => x.GameId === result.Game.GameId);

      const playerGameIds = this.playerGames.primaryIdSet;
      this.tagPlayerGames.upsertEntry(result.TagPlayerGames, (x) => playerGameIds.has(x.PlayerGameId));

      this.updateReferences();
      this.dataUpdate$.next();
      return this.games.getValue(result.Game.GameId);
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
      this.players.upsertEntry(result.Player);
      this.tagPlayers.upsertEntry(result.TagPlayers, (x) => x.PlayerId === result.Player.PlayerId);
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
      this.boardGames.upsertEntry(result.BoardGame);
      this.tagBoardGames.upsertEntry(result.TagBoardGames, (x) => x.BoardGameId === result.BoardGame.BoardGameId);
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
      this.tags.upsertEntry(result);
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
      this.games.deleteEntry(gameId);
      this.playerGames.deleteEntries((x) => x.GameId === gameId);
      this.playerGamePlayers.deleteEntries((x) => x.GameId === gameId);
      this.tagGames.deleteEntries((x) => x.GameId === gameId);

      const playerGameIds = this.playerGames.primaryIdSet;
      this.tagPlayerGames.deleteEntries((x) => !playerGameIds.has(x.PlayerGameId));
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
      this.games.upsertEntry(result);
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
      this.players.deleteEntry(playerId);
      const playerIds = this.players.primaryIdSet;
      this.playerGamePlayers.deleteEntries((x) => !playerIds.has(x.PlayerId));
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
      this.boardGames.deleteEntry(boardGameId);
      this.games.deleteEntries((x) => x.BoardGameId === boardGameId);
      this.playerGames.deleteEntries((x) => x.Game?.BoardGameId === boardGameId);

      const playerGameIds = this.playerGames.primaryIdSet;
      this.playerGamePlayers.deleteEntries((x) => !playerGameIds.has(x.PlayerGameId));
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
      this.tags.deleteEntry(tagId);
      const tagIds = this.tags.primaryIdSet;
      this.tagBoardGames.deleteEntries((x) => !tagIds.has(x.TagId));
      this.tagGames.deleteEntries((x) => !tagIds.has(x.TagId));
      this.tagPlayerGames.deleteEntries((x) => !tagIds.has(x.TagId));
      this.tagPlayers.deleteEntries((x) => !tagIds.has(x.TagId));
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
      this.games.filter((x) => {
        return (
          this.filters.includeBoardGame(x) &&
          this.filters.includeDayOfWeek(x.DateObj) &&
          this.filters.includeExcludedTag(x.Tags) &&
          this.filters.includeEndDate(x.DateObj) &&
          this.filters.includeStartDate(x.DateObj)
        );
      });
      this.boardGames.filter((x) => this.filters.includeBoardGame(x) && this.filters.includeExcludedTag(x.Tags));
      this.playerGamePlayers.filter((x) => this.filters.includePlayer(x));
      this.playerGames.filter(
        (x) =>
          this.playerGamePlayers.list.some((pgp) => pgp.PlayerGameId === x.PlayerGameId) &&
          this.filters.includeBoardGame(x.Game) &&
          this.filters.includeStartDate(x.Game?.DateObj) &&
          this.filters.includeEndDate(x.Game?.DateObj) &&
          this.filters.includeExcludedTag(x.Tags),
      );
      this.players.filter((x) => this.filters.includePlayer(x) && this.filters.includeExcludedTag(x.Tags));
    } else {
      this.entityWrappers.forEach((w) => w.clearFilter());
    }

    this.tagBoardGames.list.forEach((t) => {
      t.Tag = this.tags.getValue(t.TagId);
    });

    this.tagGames.list.forEach((t) => {
      t.Tag = this.tags.getValue(t.TagId);
    });

    this.tagPlayers.list.forEach((t) => {
      t.Tag = this.tags.getValue(t.TagId);
    });

    this.tagPlayerGames.list.forEach((t) => {
      t.Tag = this.tags.getValue(t.TagId);
    });

    this.games.sort(
      (a, b) => a.Date.toString().localeCompare(b.Date.toString()) || (a.SortIndex ?? 0) - (b.SortIndex ?? 0),
    );
    this.games.list.forEach((game) => {
      game.BoardGame = this.boardGames.getValue(game.BoardGameId);
      game.Scores = this.playerGames.list
        .filter((x) => x.GameId === game.GameId)
        .toSorted((a, b) => {
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
      game.Tags = this.tagGames.list
        .filter((x) => x.GameId === game.GameId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
    });

    this.playerGames.list.forEach((pg) => {
      pg.PlayerLinks = this.playerGamePlayers.list.filter((x) => x.PlayerGameId === pg.PlayerGameId);
      pg.Players = pg.PlayerLinks.map((p) => this.players.getValue(p.PlayerId)).filter((x) => x !== null);
      pg.PlayerIds = new Set(pg.Players.map((x) => x.PlayerId));
      pg.Game = this.games.getValue(pg.GameId);
      pg.Tags = this.tagPlayerGames.list
        .filter((x) => x.PlayerGameId === pg.PlayerGameId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
    });
    this.playerGames.sort(
      (a, b) =>
        b.Game?.Date.toString().localeCompare(a.Game?.Date.toString() ?? '') ||
        (b.Game?.SortIndex ?? 0) - (a.Game?.SortIndex ?? 0),
    );

    this.boardGames.list.forEach((bg) => {
      bg.Games = this.games.list.filter((x) => x.BoardGameId === bg.BoardGameId);
      bg.Tags = this.tagBoardGames.list
        .filter((x) => x.BoardGameId === bg.BoardGameId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
    });

    this.players.list.forEach((p) => {
      p.PlayerGames = this.playerGames.list.filter((x) => x.PlayerIds.has(p.PlayerId));
      p.Tags = this.tagPlayers.list
        .filter((x) => x.PlayerId === p.PlayerId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
    });

    this.calculatedFields();
  }

  private calculatedFields() {
    this.club?.resetCalculated(ClubEntity);
    this.entityWrappers.forEach((w) => w.resetCalculated());

    this.club?.calculate();
    this.entityWrappers.forEach((w) => w.calculate());

    PlayerEntity.postCalculate(this.players.raw);
  }
}
