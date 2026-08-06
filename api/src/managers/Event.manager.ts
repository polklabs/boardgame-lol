import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { newGuid, EventEntity } from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';

@Injectable()
export class EventManager extends BaseManager<EventEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
  ) {
    super(EventEntity);
  }

  put(userId: string, entity: EventEntity, resetID = true): EventEntity {
    entity = this.new(entity);
    if (resetID) {
      entity.EventId = newGuid();
    } else {
      // Continue
    }

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runInsert(userId, entity, false, transactions);
    return this.loadOne(entity.EventId)!;
  }

  patch(userId: string, entity: EventEntity): EventEntity {
    entity = this.new(entity);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return this.loadOne(entity.EventId)!;
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
    this.runDelete(primaryId, secondaryId);
  }

  public Validate(userId: string, entity: EventEntity): string[] {
    const errors = super.Validate(userId, entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
