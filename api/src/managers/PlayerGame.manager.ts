import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { newGuid, PlayerGameEntity } from 'libs/index';

@Injectable()
export class PlayerGameManager extends BaseManager<PlayerGameEntity> {
  constructor(protected db: DbService) {
    super(PlayerGameEntity);
  }

  put(userId: string, entity: PlayerGameEntity, resetID = true) {
    entity = this.new(entity);
    if (resetID) {
      entity.PlayerGameId = newGuid();
    } else {
      // Continue
    }

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: PlayerGameEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(primaryId: string, secondaryId: string) {
    return this.runDelete(primaryId, secondaryId, true);
  }

  public Validate(entity: PlayerGameEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
