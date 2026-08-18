import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { TagBoardGameEntity } from 'libs/index';

@Injectable()
export class TagBoardGameManager extends BaseManager<TagBoardGameEntity> {
  constructor(protected db: DbService) {
    super(TagBoardGameEntity);
  }

  upsertFilter(userId: string, ClubId: string, bgIds: string[], TagId: string, transactions: unknown[]) {
    const oldTags = new Set(this.loadMany('TagId', TagId, 'Filter', '1').map((x) => x.BoardGameId));
    bgIds.forEach((bgId) => {
      if (oldTags.has(bgId)) {
        // Do nothing
      } else {
        transactions.push(
          this.put(userId, ClubId, new TagBoardGameEntity({ TagId, ClubId, BoardGameId: bgId, Filter: true })),
        );
      }
      oldTags.delete(bgId);
    });
    oldTags.forEach((bgId) => {
      transactions.push(this.delete(TagId, bgId, true, ClubId));
    });
  }

  put(userId: string, ClubId: string, entity: TagBoardGameEntity) {
    entity = this.new({ ...entity, ClubId });

    this.SanitizeInputs(entity);
    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, ClubId: string, entity: TagBoardGameEntity) {
    entity = this.new({ ...entity, ClubId });

    this.SanitizeInputs(entity);
    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(tagId: string, boardGameId: string, filter: boolean, clubId: string) {
    return this.runDelete([tagId, boardGameId, filter ? '1' : '0'], clubId, true);
  }

  public Validate(userId: string, entity: TagBoardGameEntity): string[] {
    const errors = super.Validate(userId, entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
