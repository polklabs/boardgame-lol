import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { BoardGameEntity, newGuid } from 'libs/index';
import { ClubUserManager } from './ClubUser.manager';

@Injectable()
export class BoardGameManager extends BaseManager<BoardGameEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
  ) {
    super(BoardGameEntity);
  }

  put(userId: string, entity: BoardGameEntity, resetID = true, transact = false) {
    entity = this.new(entity);
    if (resetID) {
      entity.BoardGameId = newGuid();
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
      return this.loadOne(entity.BoardGameId);
    }
  }

  patch(userId: string, entity: BoardGameEntity) {
    entity = this.new(entity);

    this.clubUserManager.hasAccess(userId, entity.ClubId);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity);

    return this.loadOne(entity.BoardGameId);
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
    this.runDelete(primaryId, secondaryId);
  }

  public Validate(entity: BoardGameEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
