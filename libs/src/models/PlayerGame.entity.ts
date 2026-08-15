import { BaseEntity, calculationsComplete } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { PlayerEntity } from './Player.entity';
import { GameEntity } from './Game.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { TagEntity } from './Tag.entity';
import { Sanitize } from '../decorators/sanitize.decorator';
import { CHARACTER_LIMIT_TINY, POINT_MAX } from '../constants';
import { PlayerGamePlayerEntity } from './PlayerGamePlayer.entity';
import { Exclude } from 'class-transformer';

@TableName('PlayerGame')
export class PlayerGameEntity extends BaseEntity {
  @PrimaryKey()
  PlayerGameId: string = '';

  @SecondaryKey
  @Exclude()
  ClubId: string = '';

  @ForeignKey(GameEntity)
  GameId: string = '';

  @MinMax(-POINT_MAX, POINT_MAX, 'number')
  @Nullable()
  /** Use for values to be displayed */
  Points: number | null = null;

  @Nullable()
  @Sanitize()
  @MinMax(1, CHARACTER_LIMIT_TINY, 'string')
  Name: string | null = null;

  Team = false;

  TieBreaker = false;

  /** Use when comparing point values */
  get VirtualPoints() {
    if (this.Points === null) {
      return null;
    } else {
      const multiplier = (this.Game?.HigherWins ?? this.Game?.BoardGame?.HigherWins ?? true) ? 1 : -1;
      return this.TieBreaker ? Infinity : this.Points * multiplier;
    }
  }

  @Ignore()
  @MinMax(0, 8, 'array')
  Tags: TagEntity[] = [];

  @Ignore()
  @MinMax(1, 32, 'array')
  Players: PlayerEntity[] = [];

  @Ignore()
  PlayerLinks: PlayerGamePlayerEntity[] = [];

  @Ignore()
  PlayerIds = new Set<string>();

  @Ignore()
  Game: GameEntity | null = null;

  @Ignore()
  Won = false;

  @Ignore()
  ScoringPlayer = true;

  @Ignore()
  calculated = false;

  get DisplayNameFull(): string {
    if (this.Name) {
      return (this.Name ? `${this.Name}: ` : '') + this.Players?.map((p) => p.ShortName).join(', ');
    } else {
      return this.Players?.map((p) => p.FullName).join(', ');
    }
  }

  get DisplayNameShort(): string {
    if (this.Name) {
      return (this.Name ? `${this.Name}: ` : '') + this.Players?.map((p) => p.ShortName).join(', ');
    } else {
      return this.Players?.map((p) => p.ShortName).join(', ');
    }
  }

  constructor(partial: Partial<PlayerGameEntity> = {}, copyIgnored = false) {
    super();
    this.assign(partial, PlayerGameEntity, copyIgnored);
    this.PlayerLinks = partial.PlayerLinks ?? [];
    this.Tags = partial.Tags ?? [];

    this.ScoringPlayer = partial.ScoringPlayer ?? this.Points !== null;
    this.Points = this.ScoringPlayer ? this.Points : null;
  }

  calculate() {
    calculationsComplete(this.Game);
    this.Won = this.Game?.place(0).includes(this) ?? false;
    this.calculated = true;
  }
}
