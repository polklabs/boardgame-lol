import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { ITag, newGuid, TagBoardGameEntity, TagEntity, TagPlayerGameEntity } from 'libs/index';
import { TagBoardGameManager } from './TagBoardGame.manager';
import { TagGameManager } from './TagGame.manager';
import { TagPlayerManager } from './TagPlayer.manager';
import { TagGameEntity } from 'libs/models/TagGame.entity';
import { TagPlayerEntity } from 'libs/models/TagPlayer.entity';
import { ClubUserManager } from './ClubUser.manager';
import { TagPlayerGameManager } from './TagPlayerGame.manager';

type TagLink = 'boardGame' | 'game' | 'player' | 'playerGame';

@Injectable()
export class TagManager extends BaseManager<TagEntity> {
  constructor(
    protected db: DbService,
    protected clubUserManager: ClubUserManager,
    public tagBoardGame: TagBoardGameManager,
    public tagGame: TagGameManager,
    public tagPlayer: TagPlayerManager,
    public tagPlayerGame: TagPlayerGameManager,
  ) {
    super(TagEntity);
  }

  upsert(tagLink: TagLink, userId: string, clubId: string, tags: TagEntity[], linkId: string, transactions: unknown[]) {
    const oldTags = new Set(
      this.getTagLinks(tagLink, linkId)
        .map((x) => x.TagId)
        .filter((x) => x !== null),
    );
    tags.forEach((tag) => {
      tag.ClubId = clubId;
      const TagId = tag.TagId;
      if (TagId === null) {
        return;
      } else {
        // Continue
      }

      if (oldTags.has(TagId)) {
        // Do nothing
      } else {
        transactions.push(this.getTagLinkPut(tagLink, userId, clubId, TagId, linkId));
      }
      oldTags.delete(TagId);
    });
    oldTags.forEach((tagId) => {
      transactions.push(this.getTagLinkDelete(tagLink, clubId, tagId, linkId));
    });
  }
  private getTagLinks(tagLink: TagLink, linkId: string): ITag[] {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.loadMany('BoardGameId', [linkId]);
      case 'game':
        return this.tagGame.loadMany('GameId', [linkId]);
      case 'player':
        return this.tagPlayer.loadMany('PlayerId', [linkId]);
      case 'playerGame':
        return this.tagPlayerGame.loadMany('PlayerGameId', [linkId]);
      default:
        throw new NotImplementedException();
    }
  }
  private getTagLinkPut(tagLink: TagLink, userId: string, ClubId: string, TagId: string, linkId: string): unknown {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.put(userId, new TagBoardGameEntity({ TagId, ClubId, BoardGameId: linkId }));
      case 'game':
        return this.tagGame.put(userId, new TagGameEntity({ TagId, ClubId, GameId: linkId }));
      case 'player':
        return this.tagPlayer.put(userId, new TagPlayerEntity({ TagId, ClubId, PlayerId: linkId }));
      case 'playerGame':
        return this.tagPlayerGame.put(userId, new TagPlayerGameEntity({ TagId, ClubId, PlayerGameId: linkId }));
      default:
        throw new NotImplementedException();
    }
  }
  private getTagLinkDelete(tagLink: TagLink, clubId: string, tagId: string, linkId: string): unknown {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.delete(tagId, linkId, clubId);
      case 'game':
        return this.tagGame.delete(tagId, linkId, clubId);
      case 'player':
        return this.tagPlayer.delete(tagId, linkId, clubId);
      case 'playerGame':
        return this.tagPlayerGame.delete(tagId, linkId, clubId);
      default:
        throw new NotImplementedException();
    }
  }

  put(userId: string, entity: TagEntity, resetID = true, transact = false) {
    entity = this.new(entity);
    if (resetID) {
      entity.TagId = newGuid();
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
      this.runInsert(userId, entity, false);
      return this.loadOne(entity.TagId);
    }
  }

  patch(userId: string, entity: TagEntity) {
    entity = this.new(entity);

    this.SanitizeInputs(entity);
    this.Validate(entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false);

    return this.loadOne(entity.TagId);
  }

  delete(userId: string, primaryId: string, secondaryId: string) {
    this.clubUserManager.hasAccess(userId, secondaryId);
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
