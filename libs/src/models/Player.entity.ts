import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_SHORT } from '../constants';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Sanitize } from '../decorators/sanitize.decorator';

@TableName('Player')
export class PlayerEntity extends BaseEntity {
  @PrimaryKey
  PlayerId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  Name: string | null = null;

  IsRealPerson: boolean = true;

  constructor(partial: Partial<PlayerEntity> = {}) {
    super(partial);
    this.assign(partial);
  }
}
