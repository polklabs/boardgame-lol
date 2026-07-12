import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { TagBoardGameEntity } from 'libs/index';

@Injectable()
export class TagBoardGameManager extends BaseManager<TagBoardGameEntity> {
  constructor(protected db: DbService) {
    super(TagBoardGameEntity);
  }

  put(userId: string, entity: TagBoardGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: TagBoardGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(tagId: string, boardGameId: string, secondaryId: string) {
    return this.runDelete([tagId, boardGameId], secondaryId, true);
  }

  public Validate(entity: TagBoardGameEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
