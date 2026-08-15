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

  put(userId: string, ClubId: string, entity: PlayerGameEntity) {
    const tags = entity.Tags;
    entity = this.new({...entity, ClubId});

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('playerGame', userId, entity.ClubId!, tags, entity.PlayerGameId!, transactions);

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true, transactions);
  }

  patch(userId: string, ClubId: string, entity: PlayerGameEntity) {
    const tags = entity.Tags;
    entity = this.new({...entity, ClubId});

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagManager.upsert('playerGame', userId, entity.ClubId!, tags, entity.PlayerGameId!, transactions);

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true, transactions);
  }

  delete(playerGameId: string, clubId: string) {
    return this.runDelete(playerGameId, clubId, true);
  }

  public Validate(userId: string, entity: PlayerGameEntity): string[] {
    const errors = super.Validate(userId, entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
