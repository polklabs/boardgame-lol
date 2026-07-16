import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { newGuid } from 'libs/utils/guid-utils';
import { ValidationError } from 'src/errors/validation.error';
import { GameEntity, GameReturn, PlayerGameEntity, T, TagPlayerGameEntity, TP } from 'libs/index';
import { BoardGameManager } from './BoardGame.manager';
import { PlayerGameManager } from './PlayerGame.manager';
import { PlayerManager } from './Player.manager';
import { ClubUserManager } from './ClubUser.manager';
import { TagManager } from './Tag.manager';
import { PlayerGamePlayerManager } from './PlayerGamePlayer.manager';

@Injectable()
export class GameManager extends BaseManager<GameEntity> {
  constructor(
    protected db: DbService,
    protected boardGameManager: BoardGameManager,
    protected playerGamePlayerManager: PlayerGamePlayerManager,
    protected playerGameManager: PlayerGameManager,
    protected playerManager: PlayerManager,
    protected clubUserManager: ClubUserManager,
    protected tagManager: TagManager,
  ) {
    super(GameEntity);
  }

  put(userId: string, game: GameEntity): GameReturn {
    const tags = game.Tags;
    const entity = this.new(game);
    entity.GameId = newGuid();

    const playerGames = game.Scores;
    const playerGamePlayers = playerGames.flatMap((pg) => pg.PlayerLinks);

    this.AssertClubIds(game);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('game', userId, entity.ClubId!, tags, entity.GameId!, transactions);

    this.Validate(entity);
    this.CheckForeignKeys(entity);

    transactions.push(this.runInsert(userId, entity, true));

    playerGames.forEach((pg) => {
      pg.PlayerGameId = newGuid();
      pg.GameId = entity.GameId;
      transactions.push(this.playerGameManager.put(userId, pg, false));
      pg.PlayerLinks.forEach((pgp) => {
        pgp.PlayerGameId = pg.PlayerGameId;
        pgp.GameId = pg.GameId;
      });
    });

    playerGamePlayers.forEach((pgp) => {
      transactions.push(this.playerGamePlayerManager.put(userId, pgp));
    });

    this.db.Transact(transactions);

    return {
      Game: this.loadOne(entity.GameId)!,
      PlayerGamePlayers: this.playerGamePlayerManager.loadMany('GameId', entity.GameId),
      PlayerGames: this.playerGameManager.loadMany('GameId', entity.GameId),
      TagGames: this.tagManager.tagGame.loadMany('GameId', entity.GameId),
      TagPlayerGames: this.tagManager.tagPlayerGame.loadManyCustom(
        `INNER JOIN ${T(PlayerGameEntity)} ON ${TP(PlayerGameEntity, 'PlayerGameId')} = ${TP(TagPlayerGameEntity, 'PlayerGameId')}`,
        `WHERE ${TP(PlayerGameEntity, 'GameId')} = ?`,
        [entity.GameId],
      ),
    };
  }

  patch(userId: string, game: GameEntity): GameReturn {
    const tags = game.Tags;
    const entity = this.new(game);

    const playerGames = game.Scores;
    const playerGamePlayers = playerGames.flatMap((pg) => pg.PlayerLinks);

    this.AssertClubIds(game);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('game', userId, entity.ClubId!, tags, entity.GameId!, transactions);

    const playerGameIds = new Set(playerGames.map((pg) => pg.PlayerGameId));
    const oldPlayerGames = new Set(this.playerGameManager.loadMany('GameId', entity.GameId).map((x) => x.PlayerGameId));
    playerGames.forEach((pg) => {
      pg.GameId = entity.GameId;
      if (oldPlayerGames.has(pg.PlayerGameId)) {
        transactions.push(this.playerGameManager.patch(userId, pg));
        oldPlayerGames.delete(pg.PlayerGameId);
      } else {
        pg.PlayerGameId = newGuid();
        transactions.push(this.playerGameManager.put(userId, pg, false));
      }
      pg.PlayerLinks.forEach((pgp) => {
        pgp.PlayerGameId = pg.PlayerGameId;
        pgp.GameId = pg.GameId;
      });
    });
    oldPlayerGames.forEach((pgId) => {
      transactions.push(this.playerGameManager.delete(pgId, entity.ClubId));
    });

    const oldPlayerGamePlayerRows = this.playerGamePlayerManager
      .loadMany('GameId', entity.GameId)
      .filter((x) => playerGameIds.has(x.PlayerGameId));
    const oldPlayerGamePlayers = new Set(oldPlayerGamePlayerRows.map((x) => x.PlayerId));
    playerGamePlayers.forEach((pgp) => {
      if (oldPlayerGamePlayers.has(pgp.PlayerId)) {
        transactions.push(this.playerGamePlayerManager.patch(userId, pgp));
        oldPlayerGamePlayers.delete(pgp.PlayerId);
      } else {
        transactions.push(this.playerGamePlayerManager.put(userId, pgp));
      }
    });
    oldPlayerGamePlayerRows.forEach((pgp) => {
      if (oldPlayerGamePlayers.has(pgp.PlayerId)) {
        transactions.push(
          this.playerGamePlayerManager.delete(pgp.GameId, pgp.PlayerGameId, pgp.PlayerId, entity.ClubId),
        );
      } else {
        // Skip
      }
    });

    this.Validate(entity);
    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      Game: this.loadOne(entity.GameId)!,
      PlayerGamePlayers: this.playerGamePlayerManager.loadMany('GameId', entity.GameId),
      PlayerGames: this.playerGameManager.loadMany('GameId', entity.GameId),
      TagGames: this.tagManager.tagGame.loadMany('GameId', entity.GameId),
      TagPlayerGames: this.tagManager.tagPlayerGame.loadManyCustom(
        `INNER JOIN ${T(PlayerGameEntity)} ON ${TP(PlayerGameEntity, 'PlayerGameId')} = ${TP(TagPlayerGameEntity, 'PlayerGameId')}`,
        `WHERE ${TP(PlayerGameEntity, 'GameId')} = ?`,
        [entity.GameId],
      ),
    };
  }

  updateSortIndex(userId: string, primaryId: string, secondaryId: string, direction: number) {
    this.clubUserManager.hasAccess(userId, secondaryId);

    const games = this.loadMany('ClubId', secondaryId);
    const primary = games.find((x) => x.GameId === primaryId);

    if (primary) {
      const toUpdate = games
        .filter((x) => x.Date === primary?.Date)
        .sort((a, b) => (a.SortIndex ?? 0) - (b.SortIndex ?? 0));

      const index = toUpdate.indexOf(primary);
      const index2 = index + (direction > 0 ? 1 : -1);
      if ((index2 < index && index > 0) || (index2 > index && index < toUpdate.length - 1)) {
        [toUpdate[index], toUpdate[index2]] = [toUpdate[index2], toUpdate[index]];

        const transaction: unknown[] = [];
        toUpdate.forEach((item, index) => {
          item.SortIndex = index;
          transaction.push(this.runUpdate(userId, item, true));
        });

        this.db.Transact(transaction);
        return toUpdate;
      } else {
        // Nothing
      }
    } else {
      // Nothing
    }
    return [];
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
    return this.runDelete(primaryId, secondaryId, false);
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

  private AssertClubIds(game: GameEntity) {
    const id = game.ClubId;
    const valid = [
      ...game.Scores.flatMap((pg) => pg.PlayerLinks).map((x) => x.ClubId),
      ...game.Scores.map((x) => x.ClubId),
    ].every((x) => x === id);

    if (valid) {
      return true;
    } else {
      throw new ValidationError(['Mismatching Clubs']);
    }
  }
}
