import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_SHORT } from '../constants';

@TableName('Tag')
export class TagEntity extends BaseEntity {
  @PrimaryKey
  TagId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  Text: string | null = null;

  constructor(partial: Partial<TagEntity> = {}, copyIgnored = false) {
    super(partial, TagEntity);
    this.assign(partial, TagEntity, copyIgnored);
  }

  calculateFields() {}
}
