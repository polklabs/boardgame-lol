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
import { Ignore } from '../decorators/ignore.decorator';
import { GameEntity } from './Game.entity';
import { PlayerEntity } from './Player.entity';
import { Mode } from '../utils/helper-utils';

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

  @Ignore()
  Games: GameEntity[] = [];

  @Ignore()
  Champions: PlayerEntity[] = [];

  @Ignore()
  ChampionWins = 0;

  @Ignore()
  MaxPlayers = 0;

  @Ignore()
  AveragePlayers = 0;

  @Ignore()
  MaxScore = 0;

  @Ignore()
  AverageScore = 0;

  @Ignore()
  AverageWinningScore = 0;

  constructor(partial: Partial<BoardGameEntity> = {}, copyIgnored = false) {
    super(partial, BoardGameEntity);
    this.assign(partial, BoardGameEntity, copyIgnored);
  }

  calculateFields() {
    this.calculateChampion();
    this.calculatePlayers();
    this.calculateScore();
  }

  calculateChampion() {
    const winners = this.Games.map((x) => x.calculateWinner())
      .flat()
      .map((x) => x.Player!);
    this.Champions = Mode(winners, (x) => x.PlayerId ?? '');
    if (this.Champions.length > 0) {
      this.ChampionWins = winners.reduce((wins, winner) => wins + (winner.PlayerId === this.Champions[0].PlayerId ? 1 : 0), 0);
    } else {
      this.ChampionWins = 0;
    }
  }

  calculatePlayers() {
    this.MaxPlayers = Math.max(...this.Games.map((g) => g.Players), 0);
    if (this.Games.length > 0) {
      this.AveragePlayers = this.Games.reduce((sum, game) => sum + game.Players, 0) / this.Games.length;
    } else {
      this.AveragePlayers = 0;
    }
  }

  calculateScore() {
    const scores = this.Games.map((g) => g.Scores)
      .flat()
      .filter((x) => !!x.Points);
    if (this.ScoreType === 'points') {
      this.MaxScore = Math.max(...scores.map((pg) => pg.Points ?? 0), 0);

      if (scores.length > 0) {
        this.AverageScore = scores.reduce((sum, score) => sum + score.Points!, 0) / scores.length;
      } else {
        this.AverageScore = 0;
      }

      const winners = this.Games.map((g) => g.calculateWinner())
        .flat()
        .filter((x) => !!x.Points);
      if (winners.length > 0) {
        this.AverageWinningScore = winners.reduce((sum, score) => sum + score.Points!, 0) / winners.length;
      } else {
        this.AverageWinningScore = 0;
      }
    } else {
      this.MaxScore = 0;
      this.AverageScore = 0;
      this.AverageWinningScore = 0;
    }
  }
}
