import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_SHORT } from '../constants';
import { Sanitize } from '../decorators/sanitize.decorator';
import { Exclude } from 'class-transformer';

@TableName('Club')
export class ClubEntity extends BaseEntity {
  @PrimaryKey
  ClubId: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  Name: string = '';

  constructor(partial: Partial<ClubEntity> = {}) {
    super(partial, ClubEntity);
    this.assign(partial, ClubEntity, false);
  }
}
