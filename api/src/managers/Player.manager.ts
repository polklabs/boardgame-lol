import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { newGuid, PlayerEntity, PlayerReturn } from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';
import { TagManager } from './Tag.manager';

@Injectable()
export class PlayerManager extends BaseManager<PlayerEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
    protected tagManager: TagManager,
  ) {
    super(PlayerEntity);
  }

  put(userId: string, entity: PlayerEntity, resetID = true, transact = false): PlayerReturn {
    const tags = entity.Tags;
    entity = this.new(entity);
    if (resetID) {
      entity.PlayerId = newGuid();
    } else {
      // Continue
    }

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('player', userId, entity.ClubId!, tags, entity.PlayerId!, transactions);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    if (transact) {
      return this.runInsert(userId, entity, true, transactions);
    } else {
      this.clubUserManager.hasAccess(userId, entity.ClubId);
      this.runInsert(userId, entity, false, transactions);
      return {
        Player: this.loadOne(entity.PlayerId)!,
        TagPlayers: this.tagManager.tagPlayer.loadMany('ClubId', entity.ClubId),
      };
    }
  }

  patch(userId: string, entity: PlayerEntity): PlayerReturn {
    const tags = entity.Tags;
    entity = this.new(entity);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('player', userId, entity.ClubId!, tags, entity.PlayerId!, transactions);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      Player: this.loadOne(entity.PlayerId)!,
      TagPlayers: this.tagManager.tagPlayer.loadMany('ClubId', entity.ClubId),
    };
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
