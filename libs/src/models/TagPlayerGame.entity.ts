import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { TagEntity } from './Tag.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { ITag } from './ITag';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { PlayerGameEntity } from './PlayerGame.entity';

@TableName('TagPlayerGame')
export class TagPlayerGameEntity extends BaseEntity implements ITag {
  @SecondaryKey
  ClubId: string = '';

  @PrimaryKey()
  @ForeignKey(TagEntity)
  TagId: string = '';

  @PrimaryKey()
  @ForeignKey(PlayerGameEntity)
  PlayerGameId: string = '';

  @Ignore()
  Tag: TagEntity | null = null;

  constructor(partial: Partial<TagPlayerGameEntity> = {}, copyIgnored = false) {
    super(partial, TagPlayerGameEntity);
    this.assign(partial, TagPlayerGameEntity, copyIgnored);
  }

  calculate() {
    this.calculated = true;
  }
}
