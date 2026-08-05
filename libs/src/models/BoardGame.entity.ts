import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity, calculationsComplete } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_SHORT, CHARACTER_LIMIT_BYTE, POINT_MAX } from '../constants';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { Sanitize } from '../decorators/sanitize.decorator';
import { Enum } from '../decorators/enum.decorator';
import { Ignore } from '../decorators/ignore.decorator';
import { GameEntity } from './Game.entity';
import { PlayerEntity } from './Player.entity';
import { Mode } from '../utils/helper-utils';
import { TagEntity } from './Tag.entity';
import { TagBoardGameEntity } from './TagBoardGame.entity';
import { ForeignKey } from '../decorators/foreign-key.decorator';
import { PlayerGameEntity } from './PlayerGame.entity';

export type WinCount = {
  playerId: string;
  Tags: TagEntity[];
  name: string;
  wins: number;
  nonScoreCount: number;
  losses: number;
  plays: number;
  winPercent: number;
  totalPoints?: number;
  boardGame: BoardGameEntity | null | undefined;
};

export const ScoreTypes = ['points', 'rank', 'win-lose'] as const;
export type ScoreType = (typeof ScoreTypes)[number];
export const ScoreTypeMapping: Record<ScoreType, string> = {
  points: 'Points',
  rank: 'Ranked',
  'win-lose': 'Win/Lose',
} as const;

export const CopyAttrs = ['P', 'Np', 'S', 'T', 'Tp', 'N'] as const;
export type CopyAttrType = (typeof CopyAttrs)[number];
export const CopyAttrsMapping: Record<CopyAttrType, string> = {
  P: 'Players',
  Np: 'Non-Players',
  S: 'Scores',
  T: 'Tags',
  Tp: 'Score Tags',
  N: 'Notes',
} as const;

export type BoardGameReturn = {
  BoardGame: BoardGameEntity;
  TagBoardGames: TagBoardGameEntity[];
};

@TableName('BoardGame')
export class BoardGameEntity extends BaseEntity {
  @PrimaryKey()
  BoardGameId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  Name: string = '';

  @Enum(ScoreTypes)
  ScoreType: ScoreType = 'points';

  HigherWins = true;

  @Nullable()
  @MinMax(1, CHARACTER_LIMIT_BYTE, 'string')
  @Sanitize()
  ScorePrefix: string | null = null;

  @Nullable()
  @MinMax(1, CHARACTER_LIMIT_BYTE, 'string')
  @Sanitize()
  ScoreSuffix: string | null = null;

  @Nullable()
  @MinMax(1, POINT_MAX, 'number')
  PointAdjustBase: number | null = null;

  @Nullable()
  @MinMax(1, POINT_MAX, 'number')
  PointAdjustStep: number | null = null;

  // Play Creation
  @Nullable()
  @ForeignKey(GameEntity)
  NewGameRefId: string | null = null;

  // EX: P|Np|S|T|Tp|N
  // Player|NonPlayer|Scores|Tags|TagsPlayer|Notes
  @Nullable()
  NewGameRefCopy: string | null = null;

  get scoreTypeText() {
    return ScoreTypeMapping[this.ScoreType];
  }

  @Ignore()
  NewGameRefCopyItems: CopyAttrType[] = [];

  @Ignore()
  @MinMax(0, 8, 'array')
  Tags: TagEntity[] = [];

  @Ignore()
  ExampleScore = 42;

  @Ignore()
  Games: GameEntity[] = [];

  @Ignore()
  PlayCount = 0;

  @Ignore()
  Champions: PlayerEntity[] = [];

  @Ignore()
  ChampionWins = 0;

  @Ignore()
  MaxPlayers = 0;

  @Ignore()
  MinPlayers = 0;

  @Ignore()
  AveragePlayers = 0;

  @Ignore()
  UniquePlayers = 0;

  @Ignore()
  MaxScore = 0;

  @Ignore()
  MinScore = 0;

  @Ignore()
  AverageScore = 0;

  @Ignore()
  AverageWinningScore = 0;

  @Ignore()
  WinCounts: WinCount[] = [];

  @Ignore()
  calculated = false;

  constructor(partial: Partial<BoardGameEntity> = {}, copyIgnored = false) {
    super();
    this.assign(partial, BoardGameEntity, copyIgnored);
    this.Tags = partial.Tags ?? [];
    this.NewGameRefCopyItems = (this.NewGameRefCopy?.split('|').filter((x) => CopyAttrs.includes(x as CopyAttrType)) ??
      []) as CopyAttrType[];
  }

  calculate() {
    this.calculateChampion();
    this.calculatePlayers();
    this.calculateScore();
    this.PlayCount = this.Games.length;
    this.calculated = true;
  }

  calculateChampion() {
    calculationsComplete(this.Games);

    const winners = this.Games.flatMap((x) => x.Winners);
    this.Champions = Mode(winners, (x) => x.PlayerId);
    if (this.Champions.length > 0) {
      this.ChampionWins = winners.reduce(
        (wins, winner) => wins + (winner.PlayerId === this.Champions[0].PlayerId ? 1 : 0),
        0,
      );
    } else {
      this.ChampionWins = 0;
    }
  }

  calculatePlayers() {
    this.MaxPlayers = Math.max(...this.Games.map((g) => g.PlayerCount), 0);
    this.MinPlayers = Math.min(...this.Games.map((g) => g.PlayerCount), Infinity);
    this.UniquePlayers = new Set(
      this.Games.flatMap((g) => g.Scores.flatMap((s) => s.Players.map((p) => p.PlayerId))),
    ).size;
    if (this.Games.length > 0) {
      this.AveragePlayers = this.Games.reduce((sum, game) => sum + game.PlayerCount, 0) / this.Games.length;
    } else {
      this.AveragePlayers = 0;
    }
  }

  calculateScore() {
    calculationsComplete(this.Games);

    const scores = this.Games.flatMap((g) => g.Scores).filter((x) => !!x.Points);
    if (this.ScoreType === 'points') {
      this.MaxScore = Math.max(...scores.map((pg) => pg.Points ?? 0), -Infinity);
      this.MinScore = Math.min(...scores.map((pg) => pg.Points ?? 0), Infinity);

      if (scores.length > 0) {
        this.AverageScore = scores.reduce((sum, score) => sum + score.Points!, 0) / scores.length;
      } else {
        this.AverageScore = 0;
      }

      const winners = this.Games.flatMap((g) => g.place(0)).filter((x) => !!x.Points);
      if (winners.length > 0) {
        this.AverageWinningScore = winners.reduce((sum, score) => sum + score.Points!, 0) / winners.length;
      } else {
        this.AverageWinningScore = 0;
      }
    } else {
      this.MaxScore = -Infinity;
      this.MinScore = Infinity;
      this.AverageScore = -Infinity;
      this.AverageWinningScore = -Infinity;
    }
  }

  static postCalculate(boardGames: BoardGameEntity[]) {
    const getPoints = (playerGame: PlayerGameEntity, curr?: number) => {
      if (playerGame.Game?.BoardGame?.ScoreType === 'points') {
        return (curr ?? 0) + (playerGame.Points ?? 0);
      } else {
        return undefined;
      }
    };

    boardGames.forEach((bg) => {
      bg.WinCounts = [];
      bg.Games.forEach((g) => {
        g.Scores.forEach((pg) => {
          pg.Players.forEach((p) => {
            const winRow = bg.WinCounts.find((x) => x.playerId === p.PlayerId);
            const won = pg.Won;

            const played = pg.ScoringPlayer ? 1 : 0;
            const lost = !won && pg.ScoringPlayer;

            if (winRow) {
              winRow.wins += won ? 1 : 0;
              winRow.losses += lost ? 1 : 0;
              winRow.plays += played;
              winRow.nonScoreCount += 1 - played;
              winRow.winPercent = winRow.plays > 0 ? (winRow.wins / winRow.plays) * 100 : 0;
              winRow.totalPoints = getPoints(pg, winRow.totalPoints);
            } else {
              bg.WinCounts.push({
                playerId: p.PlayerId,
                name: p.FullName,
                Tags: p.Tags,
                wins: won ? 1 : 0,
                losses: lost ? 1 : 0,
                plays: played,
                winPercent: won ? 100 : 0,
                nonScoreCount: 1 - played,
                totalPoints: getPoints(pg),
                boardGame: pg.Game?.BoardGame,
              });
            }
          });
        });
      });

      bg.WinCounts.sort((a, b) => b.wins - a.wins || b.winPercent - a.winPercent || a.name.localeCompare(b.name));
    });
  }
}
