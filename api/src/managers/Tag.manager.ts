import { BaseManager } from './Base.manager';
import { DbService } from 'src/services/db.service';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { ValidationError } from 'src/errors/validation.error';
import { ITag, newGuid, TagBoardGameEntity, TagEntity, TagPlayerGameEntity, TagReturn } from 'libs/index';
import { TagBoardGameManager } from './TagBoardGame.manager';
import { TagGameManager } from './TagGame.manager';
import { TagPlayerManager } from './TagPlayer.manager';
import { TagGameEntity } from 'libs/models/TagGame.entity';
import { TagPlayerEntity } from 'libs/models/TagPlayer.entity';
import { TagPlayerGameManager } from './TagPlayerGame.manager';

type TagLink = 'boardGame' | 'game' | 'player' | 'playerGame';

@Injectable()
export class TagManager extends BaseManager<TagEntity> {
  constructor(
    protected db: DbService,
    public tagBoardGame: TagBoardGameManager,
    public tagGame: TagGameManager,
    public tagPlayer: TagPlayerManager,
    public tagPlayerGame: TagPlayerGameManager,
  ) {
    super(TagEntity);
  }

  upsert(tagLink: TagLink, userId: string, clubId: string, tags: TagEntity[], linkId: string, transactions: unknown[]) {
    const oldTags = new Set(this.getTagLinks(tagLink, linkId).map((x) => x.TagId));
    tags.forEach((tag) => {
      tag.ClubId = clubId;
      const TagId = tag.TagId;

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
        return this.tagBoardGame.loadMany('BoardGameId', linkId, 'Filter', '0');
      case 'game':
        return this.tagGame.loadMany('GameId', linkId);
      case 'player':
        return this.tagPlayer.loadMany('PlayerId', linkId);
      case 'playerGame':
        return this.tagPlayerGame.loadMany('PlayerGameId', linkId);
      default:
        throw new NotImplementedException();
    }
  }

  private getTagLinkPut(tagLink: TagLink, userId: string, ClubId: string, TagId: string, linkId: string): unknown {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.put(
          userId,
          ClubId,
          new TagBoardGameEntity({ TagId, ClubId, BoardGameId: linkId, Filter: false }),
        );
      case 'game':
        return this.tagGame.put(userId, ClubId, new TagGameEntity({ TagId, ClubId, GameId: linkId }));
      case 'player':
        return this.tagPlayer.put(userId, ClubId, new TagPlayerEntity({ TagId, ClubId, PlayerId: linkId }));
      case 'playerGame':
        return this.tagPlayerGame.put(userId, ClubId, new TagPlayerGameEntity({ TagId, ClubId, PlayerGameId: linkId }));
      default:
        throw new NotImplementedException();
    }
  }
  private getTagLinkDelete(tagLink: TagLink, clubId: string, tagId: string, linkId: string): unknown {
    switch (tagLink) {
      case 'boardGame':
        return this.tagBoardGame.delete(tagId, linkId, false, clubId);
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

  put(userId: string, ClubId: string, entity: TagEntity): TagReturn {
    const bgIds = entity.BoardGameFilter;
    entity = this.new({ ...entity, ClubId, TagId: newGuid() });

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagBoardGame.upsertFilter(userId, entity.ClubId!, bgIds, entity.TagId, transactions);

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runInsert(userId, entity, false, transactions);
    return {
      Tag: this.loadOne(entity.TagId)!,
      TagBoardGames: this.tagBoardGame.loadMany('TagId', entity.TagId).filter((x) => x.Filter),
    };
  }

  patch(userId: string, ClubId: string, entity: TagEntity): TagReturn {
    const bgIds = entity.BoardGameFilter;
    entity = this.new({ ...entity, ClubId });

    this.SanitizeInputs(entity);

    const transactions: unknown[] = [];

    this.tagBoardGame.upsertFilter(userId, entity.ClubId!, bgIds, entity.TagId, transactions);

    this.Validate(userId, entity);

    this.CheckForeignKeys(entity);

    this.runUpdate(userId, entity, false, transactions);

    return {
      Tag: this.loadOne(entity.TagId)!,
      TagBoardGames: this.tagBoardGame.loadMany('TagId', entity.TagId).filter((x) => x.Filter),
    };
  }

  delete(tagId: string, clubId: string) {
    return this.runDelete(tagId, clubId, true);
  }

  public Validate(userId: string, entity: TagEntity): string[] {
    const errors = super.Validate(userId, entity);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    } else {
      return [];
    }
  }
}
