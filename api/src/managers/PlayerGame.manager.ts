import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { newGuid, PlayerGameEntity } from 'libs/index';
import { TagManager } from './Tag.manager';

@Injectable()
export class PlayerGameManager extends BaseManager<PlayerGameEntity> {
  constructor(
    protected db: DbService,
    protected tagManager: TagManager,
  ) {
    super(PlayerGameEntity);
  }

  put(userId: string, entity: PlayerGameEntity, resetID = true) {
    const tags = entity.Tags;
    entity = this.new(entity);
    if (resetID) {
      entity.PlayerGameId = newGuid();
    } else {
      // Continue
    }

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('playerGame', userId, entity.ClubId!, tags, entity.PlayerGameId!, transactions);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true, transactions);
  }

  patch(userId: string, entity: PlayerGameEntity) {
    const tags = entity.Tags;
    entity = this.new(entity);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('playerGame', userId, entity.ClubId!, tags, entity.PlayerGameId!, transactions);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true, transactions);
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
