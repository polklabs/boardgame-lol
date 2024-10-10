import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { newGuid, PlayerEntity } from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';

@Injectable()
export class PlayerManager extends BaseManager<PlayerEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
  ) {
    super(PlayerEntity);
  }

  put(userId: string, entity: PlayerEntity, resetID = true, transact = false) {
    entity = this.new(entity);
    if (resetID) {
      entity.PlayerId = newGuid();
    } else {
      // Continue
    }

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    if (transact) {
      return this.runInsert(userId, entity, true);
    } else {
      this.clubUserManager.hasAccess(userId, entity.ClubId);
      this.runInsert(userId, entity);
      return this.loadOne(entity.PlayerId);
    }
  }

  patch(userId: string, entity: PlayerEntity) {
    entity = this.new(entity);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity);

    return this.loadOne(entity.PlayerId);
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
    this.runDelete(primaryId, secondaryId);
  }

  public Validate(entity: PlayerEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
