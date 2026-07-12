import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { ITag, newGuid, TagBoardGameEntity, TagEntity } from 'libs/index';
import { TagBoardGameManager } from './TagBoardGame.manager';

type TagLink = 'boardGame';

@Injectable()
export class TagManager extends BaseManager<TagEntity> {
  constructor(
    protected db: DbService,
    public tagBoardGame: TagBoardGameManager,
  ) {
    super(TagEntity);
  }

  upsert(tagLink: TagLink, userId: string, clubId: string, tags: TagEntity[], linkId: string, transactions: unknown[]) {
    const dbTags = new Set(this.loadMany('ClubId', [clubId]).map((x) => x.TagId));
    const oldTags = new Set(
      this.getTagLinks(tagLink, linkId)
        .map((x) => x.TagId)
        .filter((x) => x !== null),
    );
    tags.forEach((tag) => {
      let TagId = tag.TagId;
      if (TagId === null) {
        return;
      } else {
        // Continue
      }

      oldTags.delete(TagId);

      if (oldTags.has(TagId)) {
        // Do nothing
      } else {
        if (dbTags.has(TagId)) {
          // Skip put
        } else {
          TagId = newGuid();
          tag.TagId = TagId;
          transactions.push(this.put(userId, tag, false));
        }

        transactions.push(this.getTagLinkPut(tagLink, userId, clubId, TagId, linkId));
      }
    });
    oldTags.forEach((tagId) => {
      transactions.push(this.getTagLinkDelete(tagLink, clubId, tagId, linkId));
    });
  }
  private getTagLinks(tagLink: TagLink, linkId: string): ITag[] {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.loadMany('BoardGameId', [linkId]);
      default:
        throw new NotImplementedException();
    }
  }
  private getTagLinkPut(tagLink: TagLink, userId: string, ClubId: string, TagId: string, linkId: string): unknown {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.put(userId, new TagBoardGameEntity({ TagId, ClubId, BoardGameId: linkId }));
      default:
        throw new NotImplementedException();
    }
  }
  private getTagLinkDelete(tagLink: TagLink, clubId: string, tagId: string, linkId: string): unknown {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.delete(tagId, linkId, clubId);
      default:
        throw new NotImplementedException();
    }
  }

  put(userId: string, entity: TagEntity, resetID = true) {
    entity = this.new(entity);
    if (resetID) {
      entity.TagId = newGuid();
    } else {
      // Continue
    }

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runInsert(userId, entity, true);
  }

  patch(userId: string, entity: TagEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    return this.runUpdate(userId, entity, true);
  }

  delete(primaryId: string, secondaryId: string) {
    return this.runDelete([primaryId], secondaryId, true);
  }

  public Validate(entity: TagEntity): string[] {
    const errors = super.Validate(entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
