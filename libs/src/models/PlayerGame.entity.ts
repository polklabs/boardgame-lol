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
import { TagEntity } from './Tag.entity';

@TableName('PlayerGame')
export class PlayerGameEntity extends BaseEntity {
  @PrimaryKey()
  PlayerGameId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @ForeignKey(PlayerEntity)
  PlayerId: string = '';

  @ForeignKey(GameEntity)
  GameId: string = '';

  @MinMax(-999999999, 999999999, 'number')
  @Nullable()
  Points: number | null = null;

  @Ignore()
  Tags: TagEntity[] = [];

  @Ignore()
  Player: PlayerEntity | null = null;

  @Ignore()
  Game: GameEntity | null = null;

  @Ignore()
  DNF: boolean = false;

  @Ignore()
  Won = false;

  constructor(partial: Partial<PlayerGameEntity> = {}, copyIgnored = false) {
    super(partial, PlayerGameEntity);
    this.assign(partial, PlayerGameEntity, copyIgnored);
    this.DNF = partial.DNF ?? false;
  }

  calculate() {
    this.calculationsComplete(this.Game);
    this.DNF = this.Game?.BoardGame?.ScoreType === 'rank' && this.Points === null;
    this.Won = this.Game?.place(0).some((x) => x.PlayerId === this.PlayerId) ?? false;
    this.calculated = true;
  }
}
