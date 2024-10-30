import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { BoardGameEntity } from './BoardGame.entity';
import { PlayerGameEntity } from './PlayerGame.entity';
import { PlayerEntity } from './Player.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { CHARACTER_LIMIT_LONG } from '../constants';

export type GameWrapper = {
  Game: GameEntity;
  PlayerGames: PlayerGameEntity[];
  BoardGames?: BoardGameEntity[];
  Players?: PlayerEntity[];
};

export type GameReturn = {
  Game: GameEntity;
  BoardGames: BoardGameEntity[];
  PlayerGames: PlayerGameEntity[];
  Players: PlayerEntity[];
};

@TableName('Game')
export class GameEntity extends BaseEntity {
  @PrimaryKey
  GameId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @ForeignKey(BoardGameEntity)
  BoardGameId: string | null = null;

  Date: Date | string = new Date().toISOString();

  @Nullable()
  @MinMax(0, 99999, 'number')
  SortIndex: number | null = null;

  @MinMax(1, 99999, 'number')
  Players: number = 0;

  DidNotFinish: boolean = false;

  @Nullable()
  @MinMax(0, CHARACTER_LIMIT_LONG, 'string')
  Notes: string | null = null;

  get dateSortOrder() {
    return `${this.Date}T${String(this.SortIndex).padStart(6, '0')}`
  }

  @Ignore()
  BoardGame: BoardGameEntity | null = null;

  @Ignore()
  Scores: PlayerGameEntity[] = [];

  @Ignore()
  HighScore: number | null = null;

  @Ignore()
  Winners: PlayerEntity[] = [];

  constructor(partial: Partial<GameEntity> = {}, copyIgnored = false) {
    super(partial, GameEntity);
    this.assign(partial, GameEntity, copyIgnored);
  }

  calculateFields() {
    this.calculateWinners();
    this.calculateHighScore();
  }

  calculateWinners() {
    this.Winners = this.calculateWinner().map(x => x.Player!);
  }

  calculateHighScore() {
    this.HighScore = this.calculateWinner()?.[0]?.Points ?? null;
  }

  calculateWinner(): PlayerGameEntity[] {
    switch (this.BoardGame?.ScoreType) {
      case 'points':
        if (this.Scores.length > 0) {
          return this.Scores.reduce(
            (max, playerGame) => {
              if ((playerGame.Points ?? 0) > (max[0]?.Points ?? 0)) {
                return [playerGame];
              } else if ((playerGame.Points ?? 0) === (max[0]?.Points ?? 0)) {
                max.push(playerGame);
                return max;
              } else {
                return max;
              }
            },
            [] as PlayerGameEntity[]
          );
        } else {
          return [];
        }
      case 'rank':
        if (this.Scores.length > 0) {
          return this.Scores.reduce(
            (max, playerGame) => {
              if ((playerGame.Points ?? 0) < (max[0]?.Points ?? Infinity)) {
                return [playerGame];
              } else if ((playerGame.Points ?? 0) === (max[0]?.Points ?? Infinity)) {
                max.push(playerGame);
                return max;
              } else {
                return max;
              }
            },
            [] as PlayerGameEntity[]
          );
        } else {
          return [];
        }
      case 'win-lose':
        return this.Scores.filter((x) => x.Points === 1);
      default:
        return [];
    }
  }
}
