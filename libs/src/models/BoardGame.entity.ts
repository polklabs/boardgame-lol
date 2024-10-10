import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_SHORT } from '../constants';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { Expose } from 'class-transformer';
import { Sanitize } from '../decorators/sanitize.decorator';
import { Enum } from '../decorators/enum.decorator';

export const ScoreTypes = ['points', 'rank', 'win-lose'] as const;
export type ScoreType = (typeof ScoreTypes)[number];

@TableName('BoardGame')
export class BoardGameEntity extends BaseEntity {
  @PrimaryKey
  BoardGameId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  Name: string | null = null;

  @Enum(ScoreTypes)
  ScoreType: ScoreType = 'points';

  @Nullable()
  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  BoardGameGeekId: string | null = null;

  @Expose()
  get boardGameGeekUrl() {
    return `https://boardgamegeek.com/boardgame/${this.BoardGameGeekId}`;
  }

  constructor(partial: Partial<BoardGameEntity> = {}) {
    super(partial);
    this.assign(partial);
  }
}
