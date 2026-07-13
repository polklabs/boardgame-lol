import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { BoardGameEntity, BoardGameReturn, newGuid } from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';
import { TagManager } from './Tag.manager';

@Injectable()
export class BoardGameManager extends BaseManager<BoardGameEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
    protected tagManager: TagManager,
  ) {
    super(BoardGameEntity);
  }

  put(userId: string, entity: BoardGameEntity, resetID = true, transact = false): BoardGameReturn {
    const tags = entity.Tags;
    entity = this.new(entity);
    if (resetID) {
      entity.BoardGameId = newGuid();
    } else {
      // Continue
    }

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('boardGame', userId, entity.ClubId!, tags, entity.BoardGameId!, transactions);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    if (transact) {
      return this.runInsert(userId, entity, true, transactions);
    } else {
      this.clubUserManager.hasAccess(userId, entity.ClubId);
      this.runInsert(userId, entity, false, transactions);
      return {
        BoardGame: this.loadOne(entity.BoardGameId)!,
        Tags: this.tagManager.loadMany('ClubId', entity.ClubId),
        TagBoardGames: this.tagManager.tagBoardGame.loadMany('ClubId', entity.ClubId),
      };
    }
  }

  patch(userId: string, entity: BoardGameEntity): BoardGameReturn {
    const tags = entity.Tags;
    entity = this.new(entity);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('boardGame', userId, entity.ClubId!, tags, entity.BoardGameId!, transactions);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      BoardGame: this.loadOne(entity.BoardGameId)!,
      Tags: this.tagManager.loadMany('ClubId', entity.ClubId),
      TagBoardGames: this.tagManager.tagBoardGame.loadMany('ClubId', entity.ClubId),
    };
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
    this.runDelete(primaryId, secondaryId);
  }

  public Validate(entity: BoardGameEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
