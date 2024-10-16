import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { BoardGameEntity } from './BoardGame.entity';
import { PlayerGameEntity } from './PlayerGame.entity';
import { PlayerEntity } from './Player.entity';

export type GameWrapper = {
  Game: GameEntity;
  PlayerGames: PlayerGameEntity[];
  BoardGames?: BoardGameEntity[];
  Players?: PlayerEntity[];
};

export type GameReturn = {
  Game: GameEntity,
  BoardGame: BoardGameEntity[],
  PlayerGames: PlayerGameEntity[],
  Players: PlayerEntity[],
};

@TableName('Game')
export class GameEntity extends BaseEntity {
  @PrimaryKey
  GameId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @ForeignKey(BoardGameEntity)
  BoardGameId: string | null = null;

  Date = new Date().toISOString();

  @MinMax(1, 99999, 'number')
  Players: number = 0;

  DidNotFinish: boolean = false;

  constructor(partial: Partial<GameEntity> = {}) {
    super(partial);
    this.assign(partial);
  }
}
