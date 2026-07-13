import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { TagGameEntity } from 'libs/models/TagGame.entity';

@Injectable()
export class TagGameManager extends BaseManager<TagGameEntity> {
  constructor(protected db: DbService) {
    super(TagGameEntity);
  }

  put(userId: string, entity: TagGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: TagGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(tagId: string, boardGameId: string, secondaryId: string) {
    return this.runDelete([tagId, boardGameId], secondaryId, true);
  }

  public Validate(entity: TagGameEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
