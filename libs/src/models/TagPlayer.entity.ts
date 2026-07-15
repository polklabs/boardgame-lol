import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { TagEntity } from './Tag.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { ITag } from './ITag';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { PlayerEntity } from './Player.entity';

@TableName('TagPlayer')
export class TagPlayerEntity extends BaseEntity implements ITag {
  @SecondaryKey
  ClubId: string = '';

  @PrimaryKey()
  @ForeignKey(TagEntity)
  TagId: string = '';

  @PrimaryKey()
  @ForeignKey(PlayerEntity)
  PlayerId: string = '';

  @Ignore()
  Tag: TagEntity | null = null;

  @Ignore()
  calculated = false;

  constructor(partial: Partial<TagPlayerEntity> = {}, copyIgnored = false) {
    super(partial, TagPlayerEntity);
    this.assign(partial, TagPlayerEntity, copyIgnored);
  }

  calculate() {
    this.calculated = true;
  }
}
