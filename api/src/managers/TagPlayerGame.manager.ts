import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { TagPlayerGameEntity } from 'libs/models/TagPlayerGame.entity';

@Injectable()
export class TagPlayerGameManager extends BaseManager<TagPlayerGameEntity> {
  constructor(protected db: DbService) {
    super(TagPlayerGameEntity);
  }

  put(userId: string, entity: TagPlayerGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: TagPlayerGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(tagId: string, boardGameId: string, secondaryId: string) {
    return this.runDelete([tagId, boardGameId], secondaryId, true);
  }

  public Validate(entity: TagPlayerGameEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
