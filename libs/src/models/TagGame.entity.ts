import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { TagEntity } from './Tag.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { ITag } from './ITag';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { GameEntity } from './Game.entity';

@TableName('TagGame')
export class TagGameEntity extends BaseEntity implements ITag {
  @SecondaryKey
  ClubId: string | null = null;

  @PrimaryKey()
  @ForeignKey(TagEntity)
  TagId: string | null = null;

  @PrimaryKey()
  @ForeignKey(GameEntity)
  GameId: string | null = null;

  @Ignore()
  Tag: TagEntity | null = null;

  constructor(partial: Partial<TagGameEntity> = {}, copyIgnored = false) {
    super(partial, TagGameEntity);
    this.assign(partial, TagGameEntity, copyIgnored);
  }

  calculate() {
    this.calculated = true;
  }
}
