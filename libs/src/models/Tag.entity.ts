import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_BYTE, HEX_REGEX } from '../constants';
import { Sanitize } from '../decorators/sanitize.decorator';
import { ITag } from './ITag';
import { Nullable } from '../decorators/nullable.decorator';
import { Ignore } from '../decorators/ignore.decorator';
import { getAccessibleBackground } from '../utils/color-utils';
import { Pattern } from '../decorators/pattern.decorator';

@TableName('Tag')
export class TagEntity extends BaseEntity implements ITag {
  @PrimaryKey()
  TagId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @Nullable()
  @Pattern(HEX_REGEX, 'hex color in the format: #FFFFFF')
  Color: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_BYTE * 2, 'string')
  @Sanitize()
  Text: string = '';

  constructor(partial: Partial<TagEntity> = {}, copyIgnored = false) {
    super(partial, TagEntity);
    this.assign(partial, TagEntity, copyIgnored);
  }

  @Ignore()
  BackgroundColor: string = '';

  calculate() {
    this.BackgroundColor = getAccessibleBackground(this.Color ?? '');
    this.calculated = true;
  }
}
