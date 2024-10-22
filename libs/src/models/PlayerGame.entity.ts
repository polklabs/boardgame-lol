import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { PlayerEntity } from './Player.entity';
import { GameEntity } from './Game.entity';
import { Ignore } from '../decorators/ignore.decorator';

@TableName('PlayerGame')
export class PlayerGameEntity extends BaseEntity {
  @PrimaryKey
  PlayerGameId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @ForeignKey(PlayerEntity)
  PlayerId: string | null = null;

  @ForeignKey(GameEntity)
  GameId: string | null = null;

  @MinMax(-99999, 99999, 'number')
  @Nullable()
  Points: number | null = null;

  @Ignore()
  @Nullable()
  Player: PlayerEntity | null = null;

  @Ignore()
  @Nullable()
  Game: GameEntity | null = null;

  constructor(partial: Partial<PlayerGameEntity> = {}, copyIgnored = false) {
    super(partial, PlayerGameEntity);
    this.assign(partial, PlayerGameEntity, copyIgnored);
  }
}
