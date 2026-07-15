import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { PlayerGameEntity } from './PlayerGame.entity';
import { PlayerEntity } from './Player.entity';
import { GameEntity } from './Game.entity';
import { Ignore } from '../decorators/ignore.decorator';

@TableName('PlayerGamePlayer')
export class PlayerGamePlayerEntity extends BaseEntity {
  @SecondaryKey
  ClubId: string = '';

  @PrimaryKey()
  @ForeignKey(GameEntity)
  GameId: string = '';

  @PrimaryKey()
  @ForeignKey(PlayerGameEntity)
  PlayerGameId: string = '';

  @PrimaryKey()
  @ForeignKey(PlayerEntity)
  PlayerId: string = '';

  @Ignore()
  calculated = false;

  constructor(partial: Partial<PlayerGamePlayerEntity> = {}, copyIgnored = false) {
    super(partial, PlayerGamePlayerEntity);
    this.assign(partial, PlayerGamePlayerEntity, copyIgnored);
  }

  calculate() {
    this.calculated = true;
  }
}
