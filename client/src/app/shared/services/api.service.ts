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
  EventEntity,
  ClubUserEntity,
  ClubEditReturn,
} from 'libs/index';
import { TagGameEntity } from 'libs/models/TagGame.entity';
import { TagPlayerEntity } from 'libs/models/TagPlayer.entity';
import { PlayerGamePlayerEntity } from 'libs/models/PlayerGamePlayer.entity';
import { FilterModel } from '../models/filter.mode';
import { EntityWrapper } from '../models/entity-wrapper';
import { sortPlayerGames } from '../helpers/data.helper';
import { getIgnore } from 'libs/decorators/ignore.decorator';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private httpService = inject(HttpService);

  readonly clubs = new EntityWrapper(ClubEntity).setAutoClear(false);
  readonly clubUsers = new EntityWrapper(ClubUserEntity);
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
  readonly events = new EntityWrapper(EventEntity);

  private entityWrappers = [
    this.clubs,
    this.clubUsers,
    this.games,
    this.playerGames,
    this.boardGames,
    this.playerGamePlayers,
    this.players,
    this.tags,
    this.tagBoardGames,
    this.tagGames,
    this.tagPlayers,
    this.tagPlayerGames,
    this.events,
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
    this.club$.next(new ClubEntity(club));
  }

  private post<T, K = T>(put: boolean, entityType: string, data: T, ...extraIds: (string | number | null)[]) {
    const path = ['api', entityType, this.clubId, ...extraIds];
    if (put) {
      return this.httpService.put<T, K>(path, data);
    } else {
      return this.httpService.patch<T, K>(path, data);
    }
  }

  private delete(entityType: string, ...extraIds: (string | number | null)[]) {
    if (!extraIds.every(Boolean)) {
      console.log(`${entityType} id is empty`);
      return null;
    } else {
      return this.httpService.delete(['api', entityType, this.clubId, ...extraIds]);
    }
  }

  unloadClub() {
    this.club = undefined;
    this.entityWrappers.forEach((w) => w.clear());
    this.filter({}, false);
  }

  async fetchClubs() {
    const data = await this.httpService.get<ClubEntity[]>(['api', 'clubs']);

    if (data) {
      // continue
    } else {
      return;
    }

    this.clubs.overwriteAll(data);
    this.clubs.sort((a, b) => a.Name.localeCompare(b.Name));
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
    this.clubUsers.overwriteAll(data.ClubUsers);
    this.boardGames.overwriteAll(data.BoardGames);
    this.games.overwriteAll(data.Games);
    this.playerGames.overwriteAll(data.PlayerGames);
    this.playerGamePlayers.overwriteAll(data.PlayerGamePlayers);
    this.tags.overwriteAll(data.Tags);
    this.tagBoardGames.overwriteAll(data.TagBoardGames);
    this.tagGames.overwriteAll(data.TagGames);
    this.tagPlayers.overwriteAll(data.TagPlayers);
    this.tagPlayerGames.overwriteAll(data.TagPlayerGames);
    this.players.overwriteAll(data.Players);
    this.events.overwriteAll(data.Events);
    this.updateReferences();
    this.dataUpdate$.next();
  }

  async postClub(isNew: boolean, data: ClubEntity) {
    let result: ClubEditReturn | null = null;
    if (isNew) {
      result = await this.httpService.put<ClubEntity, ClubEditReturn>(['api', 'club'], data);
    } else {
      result = await this.httpService.patch<ClubEntity, ClubEditReturn>(['api', 'club'], data);
    }

    if (result) {
      this.club = new ClubEntity(result.Club);
      this.clubUsers.overwriteAll(result.ClubUsers);
      this.updateReferences();
      return this.club;
    } else {
      return null;
    }
  }

  async postGame(isNew: boolean, data: GameEntity): Promise<GameEntity | null> {
    const result: GameReturn | null = await this.post(isNew, 'game', data);

    if (result) {
      this.games.upsert(result.Game);

      this.playerGames.upsert(result.PlayerGames, (x) => x.GameId === result.Game.GameId);
      this.playerGamePlayers.upsert(result.PlayerGamePlayers, (x) => x.GameId === result.Game.GameId);
      this.tagGames.upsert(result.TagGames, (x) => x.GameId === result.Game.GameId);

      const playerGameIds = new Set(result.PlayerGames.map((x) => x.PlayerGameId));
      this.tagPlayerGames.upsert(result.TagPlayerGames, (x) => playerGameIds.has(x.PlayerGameId));

      this.updateReferences();
      this.dataUpdate$.next();
      return this.games.getOne(result.Game.GameId);
    } else {
      return null;
    }
  }

  async postPlayer(isNew: boolean, entity: PlayerEntity) {
    const result: PlayerReturn | null = await this.post(isNew, 'player', entity);

    if (result) {
      this.players.upsert(result.Player);
      this.tagPlayers.upsert(result.TagPlayers, (x) => x.PlayerId === result.Player.PlayerId);
      this.updateReferences();
      this.dataUpdate$.next();
      return this.players.getOne(result.Player.PlayerId);
    } else {
      return null;
    }
  }

  async postBoardGame(isNew: boolean, entity: BoardGameEntity) {
    const result: BoardGameReturn | null = await this.post(isNew, 'board-game', entity);

    if (result) {
      this.boardGames.upsert(result.BoardGame);
      this.tagBoardGames.upsert(result.TagBoardGames, (x) => x.BoardGameId === result.BoardGame.BoardGameId);
      this.updateReferences();
      this.dataUpdate$.next();
      return this.boardGames.getOne(result.BoardGame.BoardGameId);
    } else {
      return null;
    }
  }

  async postTag(isNew: boolean, entity: TagEntity) {
    const result: TagEntity | null = await this.post(isNew, 'tag', entity);

    if (result) {
      this.tags.upsert(result);
      this.updateReferences();
      this.dataUpdate$.next();
      return this.tags.getOne(result.TagId);
    } else {
      return null;
    }
  }

  async postEvent(isNew: boolean, entity: EventEntity) {
    const result: EventEntity | null = await this.post(isNew, 'event', entity);

    if (result) {
      this.events.upsert(result);
      this.updateReferences();
      this.dataUpdate$.next();
      return this.events.getOne(result.EventId);
    } else {
      return null;
    }
  }

  async deleteGame(gameId: string) {
    const result = await this.delete('game', gameId);

    if (result) {
      this.games.deleteOne(gameId);
      this.playerGames.deleteMany((x) => x.GameId === gameId);
      this.playerGamePlayers.deleteMany((x) => x.GameId === gameId);
      this.tagGames.deleteMany((x) => x.GameId === gameId);

      const playerGameIds = this.playerGames.primaryIdSet;
      this.tagPlayerGames.deleteMany((x) => !playerGameIds.has(x.PlayerGameId));
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async updateGameIndex(gameId: string | null, direction: number) {
    const result = await this.post<null, GameEntity[]>(false, 'game', null, gameId, direction);

    if (result) {
      this.games.upsert(result);
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deletePlayer(playerId: string) {
    const result = await this.delete('player', playerId);

    if (result) {
      this.players.deleteOne(playerId);
      const playerIds = this.players.primaryIdSet;
      this.playerGamePlayers.deleteMany((x) => !playerIds.has(x.PlayerId));
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deleteBoardGame(boardGameId: string) {
    const result = await this.delete('board-game', boardGameId);

    if (result) {
      this.boardGames.deleteOne(boardGameId);
      this.games.deleteMany((x) => x.BoardGameId === boardGameId);
      this.playerGames.deleteMany((x) => x.Game?.BoardGameId === boardGameId);

      const playerGameIds = this.playerGames.primaryIdSet;
      this.playerGamePlayers.deleteMany((x) => !playerGameIds.has(x.PlayerGameId));
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deleteTag(tagId: string) {
    const result = await this.delete('tag', tagId);

    if (result) {
      this.tags.deleteOne(tagId);
      const tagIds = this.tags.primaryIdSet;
      this.tagBoardGames.deleteMany((x) => !tagIds.has(x.TagId));
      this.tagGames.deleteMany((x) => !tagIds.has(x.TagId));
      this.tagPlayerGames.deleteMany((x) => !tagIds.has(x.TagId));
      this.tagPlayers.deleteMany((x) => !tagIds.has(x.TagId));
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  async deleteClub() {
    const result = await this.delete('club');

    if (result) {
      this.unloadClub();
      return true;
    } else {
      return false;
    }
  }

  async deleteEvent(eventId: string) {
    const result = await this.delete('event', eventId);

    if (result) {
      this.events.deleteOne(eventId);
      this.updateReferences();
      this.dataUpdate$.next();
      return true;
    } else {
      return false;
    }
  }

  filter(filter: Partial<FilterModel>, triggerUpdate = true) {
    this.filters.assign(filter);
    this.filterEnabled$.next(this.filters.enabled);
    this.updateReferences();
    if (triggerUpdate) {
      this.dataUpdate$.next();
    } else {
      // continue
    }
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

    // Assign Internal References ----------------------------------

    if (this.club) {
      this.club.Users = this.clubUsers.list;
    } else {
      // Continue
    }

    this.tagBoardGames.list.forEach((t) => {
      t.Tag = this.tags.getOne(t.TagId);
    });

    this.tagGames.list.forEach((t) => {
      t.Tag = this.tags.getOne(t.TagId);
    });

    this.tagPlayers.list.forEach((t) => {
      t.Tag = this.tags.getOne(t.TagId);
    });

    this.tagPlayerGames.list.forEach((t) => {
      t.Tag = this.tags.getOne(t.TagId);
    });

    this.boardGames.sort((a, b) => a.Name.localeCompare(b.Name));
    this.boardGames.list.forEach((bg) => {
      bg.Games = this.games.list.filter((x) => x.BoardGameId === bg.BoardGameId);
      bg.Tags = this.tagBoardGames.list
        .filter((x) => x.BoardGameId === bg.BoardGameId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
    });

    this.playerGames.list.forEach((pg) => {
      pg.PlayerLinks = this.playerGamePlayers.getByForeignKey(pg.PlayerGameId);
      pg.Players = pg.PlayerLinks.map((p) => this.players.getOne(p.PlayerId)).filter((x) => x !== null);
      pg.PlayerIds = new Set(pg.Players.map((x) => x.PlayerId));
      pg.Game = this.games.getOne(pg.GameId);
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

    this.players.list.forEach((p) => {
      p.PlayerGames = this.playerGames.list.filter((x) => x.PlayerIds.has(p.PlayerId));
      p.Tags = this.tagPlayers.list
        .filter((x) => x.PlayerId === p.PlayerId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
    });

    this.games.sort((a, b) => b.dateSortOrder.localeCompare(a.dateSortOrder));
    this.games.list.forEach((game) => {
      game.BoardGame = this.boardGames.getOne(game.BoardGameId);
      game.Scores = sortPlayerGames(false, this.playerGames.getByForeignKey(game.GameId), game);
      game.Tags = this.tagGames.list
        .filter((x) => x.GameId === game.GameId)
        .map((t) => t.Tag)
        .filter((x) => x !== null);
      game.Events = [];
    });

    this.events.sort((a, b) => b.StartDate.localeCompare(a.StartDate));
    this.events.list.forEach((e) => {
      e.Games = this.games.list.filter((g) => g.Date >= e.StartDate && g.Date <= e.EndDate);
      e.Games.forEach((g) => {
        g.Events.push(e);
      });
    });

    this.calculatedFields();

    this.playerGames.list.forEach((pg) => {
      pg.Players.sort((a, b) => a.ShortName.localeCompare(b.ShortName));
    });
    this.players.sort((a, b) => a.FullName.localeCompare(b.FullName));
  }

  private calculatedFields() {
    this.club?.resetCalculated(new ClubEntity({}), getIgnore(ClubEntity));
    this.entityWrappers.forEach((w) => w.resetCalculated());

    this.club?.calculate();
    this.entityWrappers.forEach((w) => w.calculate());

    PlayerEntity.postCalculate(this.players.raw);
    BoardGameEntity.postCalculate(this.boardGames.raw);
  }
}
