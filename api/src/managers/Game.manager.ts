import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { newGuid } from 'libs/utils/guid-utils';
import { ValidationError } from 'src/errors/validation.error';
import { GameEntity, GameWrapper } from 'libs/index';
import { BoardGameManager } from './BoardGame.manager';
import { PlayerGameManager } from './PlayerGame.manager';
import { PlayerManager } from './Player.manager';
import { ClubUserManager } from './ClubUser.manager';

@Injectable()
export class GameManager extends BaseManager<GameEntity> {
  constructor(
    protected db: DbService,
    protected boardGameManager: BoardGameManager,
    protected playerGameManager: PlayerGameManager,
    protected playerManager: PlayerManager,
    protected clubUserManager: ClubUserManager,
  ) {
    super(GameEntity);
  }

  put(userId: string, wrapper: GameWrapper) {
    const entity = this.new(wrapper.Game);
    entity.GameId = newGuid();

    this.AssertClubIds(wrapper);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    wrapper.BoardGames?.forEach((boardGame) => {
      const oldGuid = boardGame.BoardGameId;
      const guid = newGuid();
      boardGame.BoardGameId = guid;
      if (entity.BoardGameId === oldGuid) {
        entity.BoardGameId = guid;
      } else {
        // Skip
      }

      transactions.push(this.boardGameManager.put(userId, boardGame, false, true));
    });

    wrapper.Players?.forEach((player) => {
      const oldGuid = player.PlayerId;
      const guid = newGuid();
      player.PlayerId = guid;
      wrapper.PlayerGames.filter((x) => x.PlayerId === oldGuid).forEach((pg) => (pg.PlayerId = guid));

      transactions.push(this.playerManager.put(userId, player, false, true));
    });

    this.Validate(entity);
    this.CheckForeignKeys(entity);

    transactions.push(this.runInsert(userId, entity, true));

    wrapper.PlayerGames.forEach((pg) => {
      pg.GameId = entity.GameId;
      transactions.push(this.playerGameManager.put(userId, pg));
    });

    this.db.Transact(transactions);

    return {
      Game: this.loadOne(entity.GameId),
      BoardGames: this.boardGameManager.loadMany('ClubId', entity.ClubId),
      PlayerGames: this.playerGameManager.loadMany('GameId', entity.GameId, 'ClubId', entity.ClubId),
      Players: this.playerManager.loadMany('ClubId', entity.ClubId),
    };
  }

  patch(userId: string, wrapper: GameWrapper) {
    const entity = this.new(wrapper.Game);

    this.AssertClubIds(wrapper);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    wrapper.BoardGames?.forEach((boardGame) => {
      const oldGuid = boardGame.BoardGameId;
      const guid = newGuid();
      boardGame.BoardGameId = guid;
      if (entity.BoardGameId === oldGuid) {
        entity.BoardGameId = guid;
      } else {
        // Skip
      }

      transactions.push(this.boardGameManager.put(userId, boardGame, false, true));
    });

    wrapper.Players?.forEach((player) => {
      const oldGuid = player.PlayerId;
      const guid = newGuid();
      player.PlayerId = guid;
      wrapper.PlayerGames.filter((x) => x.PlayerId === oldGuid).forEach((pg) => (pg.PlayerId = guid));

      transactions.push(this.playerManager.put(userId, player, false, true));
    });

    const oldPlayerGames = new Set(this.playerGameManager.loadMany('GameId', entity.GameId).map((x) => x.PlayerGameId));
    const newPlayerGames = new Set<string>();
    wrapper.PlayerGames.forEach((pg) => {
      pg.GameId = entity.GameId;
      if (pg.PlayerGameId && oldPlayerGames.has(pg.PlayerGameId)) {
        transactions.push(this.playerGameManager.patch(userId, pg));
        newPlayerGames.add(pg.PlayerGameId);
      } else {
        transactions.push(this.playerGameManager.put(userId, pg));
      }
    });
    oldPlayerGames.forEach((pgId) => {
      if (!pgId || newPlayerGames.has(pgId)) {
        // Continue
      } else {
        transactions.push(this.playerGameManager.delete(pgId, entity.ClubId!));
      }
    });

    this.Validate(entity);
    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      Game: this.loadOne(entity.GameId),
      BoardGame: this.boardGameManager.loadMany('ClubId', entity.ClubId),
      PlayerGames: this.playerGameManager.loadMany('GameId', entity.GameId, 'ClubId', entity.ClubId),
      Players: this.playerManager.loadMany('ClubId', entity.ClubId),
    };
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
    return this.runDelete(primaryId, secondaryId, true);
  }

  public Validate(entity: GameEntity): string[] {
    const errors = super.Validate(entity);

    // Other validation checks

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }

  private AssertClubIds(wrapper: GameWrapper) {
    const id = wrapper.Game.ClubId;
    const valid = [
      ...(wrapper.BoardGames?.map((x) => x.ClubId) ?? []),
      ...(wrapper.PlayerGames?.map((x) => x.ClubId) ?? []),
      ...(wrapper.Players?.map((x) => x.ClubId) ?? []),
    ].every((x) => x === id);

    if (valid) {
      return true;
    } else {
      throw new ValidationError(['Mismatching Clubs']);
    }
  }
}
