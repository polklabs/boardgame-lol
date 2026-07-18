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
import { CHARACTER_LIMIT_TINY } from '../constants';
import { Expose } from 'class-transformer';
import { PlayerGamePlayerEntity } from './PlayerGamePlayer.entity';

@TableName('PlayerGame')
export class PlayerGameEntity extends BaseEntity {
  @PrimaryKey()
  PlayerGameId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @ForeignKey(GameEntity)
  GameId: string = '';

  @MinMax(-1000000, 1000000, 'number')
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
      return 0;
    } else {
      return this.Points * 2 + (this.TieBreaker ? 1 : 0);
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
  DNF: boolean = false;

  @Ignore()
  Won = false;

  @Ignore()
  calculated = false;

  @Expose()
  get DisplayName(): string {
    return this.Name || this.Players?.map((p) => p.Nickname ?? p.Name).join(', ');
  }

  constructor(partial: Partial<PlayerGameEntity> = {}, copyIgnored = false) {
    super(partial, PlayerGameEntity);
    this.assign(partial, PlayerGameEntity, copyIgnored);
    this.DNF = partial.DNF ?? false;
    this.PlayerLinks = partial.PlayerLinks ?? [];
    this.Tags = partial.Tags ?? [];
  }

  calculate() {
    calculationsComplete(this.Game);
    this.DNF = this.Game?.BoardGame?.ScoreType === 'rank' && this.Points === null;
    this.Won = this.Game?.place(0).includes(this) ?? false;
    this.calculated = true;
  }
}
