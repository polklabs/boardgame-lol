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

  StartDate: string = new Date().toISOString();
  EndDate: string = new Date().toISOString();

  @MinMax(0, CHARACTER_LIMIT_TINY, 'string')
  Name: string = '';

  @Ignore()
  Games: GameEntity[] = [];

  @Ignore()
  DateObj: [Date, Date];

  @Ignore()
  calculated = false;

  constructor(partial: Partial<EventEntity> = {}, copyIgnored = false) {
    super();
    this.assign(partial, EventEntity, copyIgnored);

    let StartDateObj = new Date(this.StartDate);
    const userTimezoneOffset = StartDateObj.getTimezoneOffset() * 60000;
    StartDateObj = new Date(StartDateObj.getTime() + userTimezoneOffset);

    let EndDateObj = new Date(this.EndDate);
    EndDateObj = new Date(EndDateObj.getTime() + userTimezoneOffset);

    this.DateObj = [StartDateObj, EndDateObj];
  }

  calculate() {
    this.calculated = true;
  }
}
