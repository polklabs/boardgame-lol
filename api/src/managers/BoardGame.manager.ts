import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { BoardGameEntity, BoardGameReturn, newGuid } from 'libs/index';
import { TagManager } from './Tag.manager';

@Injectable()
export class BoardGameManager extends BaseManager<BoardGameEntity> {
  constructor(
    protected db: DbService,
    protected tagManager: TagManager,
  ) {
    super(BoardGameEntity);
  }

  put(userId: string, ClubId: string, entity: BoardGameEntity): BoardGameReturn {
    const tags = entity.Tags;
    entity = this.new({ ...entity, ClubId, BoardGameId: newGuid() });

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('boardGame', userId, entity.ClubId!, tags, entity.BoardGameId!, transactions);

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runInsert(userId, entity, false, transactions);
    return {
      BoardGame: this.loadOne(entity.BoardGameId)!,
      TagBoardGames: this.tagManager.tagBoardGame.loadMany('ClubId', entity.ClubId, 'BoardGameId', entity.BoardGameId),
    };
  }

  patch(userId: string, ClubId: string, entity: BoardGameEntity): BoardGameReturn {
    const tags = entity.Tags;
    entity = this.new({ ...entity, ClubId });

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('boardGame', userId, entity.ClubId!, tags, entity.BoardGameId!, transactions);

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      BoardGame: this.loadOne(entity.BoardGameId)!,
      TagBoardGames: this.tagManager.tagBoardGame.loadMany('ClubId', entity.ClubId, 'BoardGameId', entity.BoardGameId),
    };
  }

  delete(boardGameId: string, clubId: string) {
    this.runDelete(boardGameId, clubId);
  }

  public Validate(userId: string, entity: BoardGameEntity): string[] {
    const errors = super.Validate(userId, entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
