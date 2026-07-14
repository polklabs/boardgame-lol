import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { TagEntity } from './Tag.entity';
import { BoardGameEntity } from './BoardGame.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { ITag } from './ITag';
import { PrimaryKey } from '../decorators/primary-key.decorator';

@TableName('TagBoardGame')
export class TagBoardGameEntity extends BaseEntity implements ITag {
  @SecondaryKey
  ClubId: string = '';

  @PrimaryKey()
  @ForeignKey(TagEntity)
  TagId: string = '';

  @PrimaryKey()
  @ForeignKey(BoardGameEntity)
  BoardGameId: string = '';

  @Ignore()
  Tag: TagEntity | null = null;

  constructor(partial: Partial<TagBoardGameEntity> = {}, copyIgnored = false) {
    super(partial, TagBoardGameEntity);
    this.assign(partial, TagBoardGameEntity, copyIgnored);
  }

  calculate() {
    this.calculated = true;
  }
}
