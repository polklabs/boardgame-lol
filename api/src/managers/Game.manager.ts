import { DbService } from 'src/services/db.service';
import { BaseManager } from './Base.manager';
import { Injectable } from '@nestjs/common';
import { newGuid } from 'libs/utils/guid-utils';
import { ValidationError } from 'src/errors/validation.error';
import { GameEntity, GameReturn, PlayerGameEntity, TagPlayerGameEntity, TP } from 'libs/index';
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

  put(userId: string, ClubId: string, entity: GameEntity): GameReturn {
    const tags = entity.Tags;
    const scores = entity.Scores;
    entity = this.new({ ...entity, ClubId, GameId: newGuid() });

    const playerGamePlayers = scores.flatMap((pg) => pg.PlayerLinks);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.Validate(userId, entity, scores);
    this.CheckForeignKeys(entity);

    transactions.push(this.runInsert(userId, entity, true));

    this.tagManager.upsert('game', userId, entity.ClubId!, tags, entity.GameId!, transactions);

    scores.forEach((pg) => {
      pg.ClubId = entity.ClubId;
      pg.PlayerGameId = newGuid();
      pg.GameId = entity.GameId;
      transactions.push(this.playerGameManager.put(userId, ClubId, pg));
      pg.PlayerLinks.forEach((pgp) => {
        pgp.PlayerGameId = pg.PlayerGameId;
        pgp.GameId = pg.GameId;
      });
    });

    playerGamePlayers.forEach((pgp) => {
      pgp.GameId = entity.GameId;
      pgp.ClubId = entity.ClubId;
      transactions.push(this.playerGamePlayerManager.put(userId, ClubId, pgp));
    });

    this.db.Transact(transactions);

    return {
      Game: this.loadOne(entity.GameId)!,
      PlayerGamePlayers: this.playerGamePlayerManager.loadMany('GameId', entity.GameId),
      PlayerGames: this.playerGameManager.loadMany('GameId', entity.GameId),
      TagGames: this.tagManager.tagGame.loadMany('GameId', entity.GameId),
      TagPlayerGames: this.tagManager.tagPlayerGame.loadManyCustom(
        `INNER JOIN ${TP(PlayerGameEntity)} ON ${TP(PlayerGameEntity, 'PlayerGameId')} = ${TP(TagPlayerGameEntity, 'PlayerGameId')}`,
        `WHERE ${TP(PlayerGameEntity, 'GameId')} = ?`,
        [entity.GameId],
      ),
    };
  }

  patch(userId: string, ClubId: string, entity: GameEntity): GameReturn {
    const tags = entity.Tags;
    const playerGames = entity.Scores;

    entity = this.new({ ...entity, ClubId });

    const playerGamePlayers = playerGames.flatMap((pg) => pg.PlayerLinks);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('game', userId, entity.ClubId!, tags, entity.GameId!, transactions);

    const playerGameIds = new Set(playerGames.map((pg) => pg.PlayerGameId));
    const oldPlayerGames = new Set(this.playerGameManager.loadMany('GameId', entity.GameId).map((x) => x.PlayerGameId));
    playerGames.forEach((pg) => {
      pg.ClubId = entity.ClubId;
      pg.GameId = entity.GameId;
      if (oldPlayerGames.has(pg.PlayerGameId)) {
        transactions.push(this.playerGameManager.patch(userId, ClubId, pg));
        oldPlayerGames.delete(pg.PlayerGameId);
      } else {
        pg.PlayerGameId = newGuid();
        transactions.push(this.playerGameManager.put(userId, ClubId, pg));
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
    const oldPlayerGamePlayers = new Set(oldPlayerGamePlayerRows.map((x) => `${x.PlayerGameId};${x.PlayerId}`));
    playerGamePlayers.forEach((pgp) => {
      pgp.ClubId = entity.ClubId;
      const pgpId = `${pgp.PlayerGameId};${pgp.PlayerId}`;
      if (oldPlayerGamePlayers.has(pgpId)) {
        transactions.push(this.playerGamePlayerManager.patch(userId, ClubId, pgp));
        oldPlayerGamePlayers.delete(pgpId);
      } else {
        transactions.push(this.playerGamePlayerManager.put(userId, ClubId, pgp));
      }
    });
    oldPlayerGamePlayerRows.forEach((pgp) => {
      const pgpId = `${pgp.PlayerGameId};${pgp.PlayerId}`;
      if (oldPlayerGamePlayers.has(pgpId)) {
        transactions.push(
          this.playerGamePlayerManager.delete(pgp.GameId, pgp.PlayerGameId, pgp.PlayerId, entity.ClubId),
        );
      } else {
        // Skip
      }
    });

    this.Validate(userId, entity, playerGames);
    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      Game: this.loadOne(entity.GameId)!,
      PlayerGamePlayers: this.playerGamePlayerManager.loadMany('GameId', entity.GameId),
      PlayerGames: this.playerGameManager.loadMany('GameId', entity.GameId),
      TagGames: this.tagManager.tagGame.loadMany('GameId', entity.GameId),
      TagPlayerGames: this.tagManager.tagPlayerGame.loadManyCustom(
        `INNER JOIN ${TP(PlayerGameEntity)} ON ${TP(PlayerGameEntity, 'PlayerGameId')} = ${TP(TagPlayerGameEntity, 'PlayerGameId')}`,
        `WHERE ${TP(PlayerGameEntity, 'GameId')} = ?`,
        [entity.GameId],
      ),
    };
  }

  updateSortIndex(userId: string, clubId: string, gameId: string, direction: number) {
    const games = this.loadMany('ClubId', clubId);
    const primary = games.find((x) => x.GameId === gameId);

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

  delete(gameId: string, clubId: string) {
    return this.runDelete(gameId, clubId, false);
  }

  public Validate(userId: string, entity: GameEntity, playerGames: PlayerGameEntity[]): string[] {
    const errors = super.Validate(userId, entity);

    // Other validation checks
    const tieBreakerCount = playerGames.reduce((prev, curr) => prev + (curr.TieBreaker ? 1 : 0), 0);
    if (tieBreakerCount > 1) {
      errors.push(`${tieBreakerCount} > 1 allowed tiebreaker`);
    } else {
      // Continue
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
