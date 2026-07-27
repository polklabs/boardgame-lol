import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Ignore } from '../decorators/ignore.decorator';
import { CHARACTER_LIMIT_TINY } from '../constants';
import { GameEntity } from './Game.entity';

@TableName('Event')
export class EventEntity extends BaseEntity {
  @PrimaryKey()
  EventId: string = '';

  @SecondaryKey
  ClubId: string = '';

  StartDate: Date | string = new Date().toISOString();
  EndDate: Date | string = new Date().toISOString();

  @MinMax(0, CHARACTER_LIMIT_TINY, 'string')
  Name: string | null = null;

  @Ignore()
  Games: GameEntity[] = [];

  @Ignore()
  StartDateObj: Date;

  @Ignore()
  EndDateObj: Date;

  @Ignore()
  calculated = false;

  constructor(partial: Partial<EventEntity> = {}, copyIgnored = false) {
    super();
    this.assign(partial, EventEntity, copyIgnored);

    this.StartDateObj = new Date(this.StartDate);
    const userTimezoneOffset = this.StartDateObj.getTimezoneOffset() * 60000;
    this.StartDateObj = new Date(this.StartDateObj.getTime() + userTimezoneOffset);

    this.EndDateObj = new Date(this.EndDate);
    this.EndDateObj = new Date(this.EndDateObj.getTime() + userTimezoneOffset);
  }

  calculate() {
    this.calculated = true;
  }
}
