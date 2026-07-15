import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { PlayerGamePlayerEntity } from 'libs/models/PlayerGamePlayer.entity';

@Injectable()
export class PlayerGamePlayerManager extends BaseManager<PlayerGamePlayerEntity> {
  constructor(protected db: DbService) {
    super(PlayerGamePlayerEntity);
  }

  put(userId: string, entity: PlayerGamePlayerEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: PlayerGamePlayerEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);

    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(playerGameId: string, playerId: string, secondaryId: string) {
    return this.runDelete([playerGameId, playerId], secondaryId, true);
  }

  public Validate(entity: PlayerGamePlayerEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
