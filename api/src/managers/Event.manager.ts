import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { newGuid, EventEntity } from 'libs/index';

@Injectable()
export class EventManager extends BaseManager<EventEntity> {
  constructor(protected db: DbService) {
    super(EventEntity);
  }

  put(userId: string, ClubId: string, entity: EventEntity): EventEntity {
    entity = this.new({ ...entity, ClubId, EventId: newGuid() });

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runInsert(userId, entity, false, transactions);
    return this.loadOne(entity.EventId)!;
  }

  patch(userId: string, ClubId: string, entity: EventEntity): EventEntity {
    entity = this.new({ ...entity, ClubId });

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return this.loadOne(entity.EventId)!;
  }

  delete(eventId: string, clubId: string) {
    this.runDelete(eventId, clubId);
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
