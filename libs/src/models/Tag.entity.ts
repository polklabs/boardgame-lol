import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_BYTE } from '../constants';
import { Sanitize } from '../decorators/sanitize.decorator';
import { ITag } from './ITag';
import { Nullable } from '../decorators/nullable.decorator';

@TableName('Tag')
export class TagEntity extends BaseEntity implements ITag {
  @PrimaryKey()
  TagId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @Sanitize()
  @Nullable()
  @MinMax(CHARACTER_LIMIT_BYTE, CHARACTER_LIMIT_BYTE, 'string')
  Color: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_BYTE * 2, 'string')
  @Sanitize()
  Text: string = '';

  constructor(partial: Partial<TagEntity> = {}, copyIgnored = false) {
    super(partial, TagEntity);
    this.assign(partial, TagEntity, copyIgnored);
  }

  calculate() {
    this.calculated = true;
  }
}
