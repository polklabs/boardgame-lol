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
import { max } from 'date-fns/max';
import { min } from 'date-fns/min';
import { TagEntity } from './Tag.entity';
import { TagGameEntity } from './TagGame.entity';
import { TagBoardGameEntity } from './TagBoardGame.entity';
import { TagPlayerEntity } from './TagPlayer.entity';

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
  Tags: TagEntity[];
  TagGames: TagGameEntity[];
  TagBoardGames: TagBoardGameEntity[];
  TagPlayers: TagPlayerEntity[];
};

@TableName('Game')
export class GameEntity extends BaseEntity {
  @PrimaryKey()
  GameId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @ForeignKey(BoardGameEntity)
  BoardGameId: string = '';

  Date: Date | string = new Date().toISOString();

  @Nullable()
  @MinMax(0, 99999, 'number')
  SortIndex: number | null = null;

  @MinMax(1, 99999, 'number')
  Players: number = 0;

  @Nullable()
  @MinMax(0, CHARACTER_LIMIT_LONG, 'string')
  Notes: string | null = null;

  get dateSortOrder() {
    return `${this.Date}T${String(this.SortIndex).padStart(6, '0')}`;
  }

  get ScoreType() {
    return this.BoardGame?.ScoreType ?? '';
  }

  @Ignore()
  Tags: TagEntity[] = [];

  @Ignore()
  newest = false;

  @Ignore()
  oldest = false;

  @Ignore()
  DateObj: Date;

  @Ignore()
  BoardGame: BoardGameEntity | null = null;

  @Ignore()
  Scores: PlayerGameEntity[] = [];

  @Ignore()
  HighScore: number | null = null;

  @Ignore()
  private Places: Record<number, Set<PlayerGameEntity>> = {};

  @Ignore()
  Winners: PlayerEntity[] = [];

  constructor(partial: Partial<GameEntity> = {}, copyIgnored = false) {
    super(partial, GameEntity);
    this.assign(partial, GameEntity, copyIgnored);

    this.DateObj = new Date(this.Date);
    const userTimezoneOffset = this.DateObj.getTimezoneOffset() * 60000;
    this.DateObj = new Date(this.DateObj.getTime() + userTimezoneOffset);
  }

  findPlace(pg: PlayerGameEntity): number | null {
    for (const key of Object.keys(this.Places)) {
      if (this.Places[+key].has(pg)) {
        return +key;
      }
    }
    return null;
  }

  place(place: number): PlayerGameEntity[] {
    if (place in this.Places) {
      return [...this.Places[place]];
    } else {
      return [];
    }
  }

  placePlayers(place: number): PlayerEntity[] {
    if (place in this.Places) {
      return [...this.Places[place]].map((x) => x.Player).filter((x) => x !== null);
    } else {
      return [];
    }
  }

  calculate() {
    this.calculateWinners();
    this.Winners = this.placePlayers(0);
    this.HighScore = this.place(0).at(0)?.Points ?? null;
    this.calculated = true;
  }

  calculateWinners() {
    this.Places = {};
    const scoreBuckets = [...new Set(this.Scores.map((x) => x.Points))].filter((x) => x !== null);

    new Array(scoreBuckets.length).fill(0).forEach((_, i) => {
      this.Places[i] = new Set();
    });

    if (this.BoardGame?.ScoreType === 'rank') {
      scoreBuckets.sort((a, b) => a - b);
    } else {
      scoreBuckets.sort((a, b) => b - a);
    }

    this.Scores.forEach((s) => {
      if (s.Points !== null) {
        const bucket = scoreBuckets.indexOf(s.Points);
        this.Places[bucket].add(s);
      }
    });
  }

  static postCalculate(games: GameEntity[]) {
    const newestDate = max(games.map((x) => x.DateObj)).getTime();
    const oldestDate = min(games.map((x) => x.DateObj)).getTime();
    games.forEach((g) => {
      g.newest = g.DateObj.getTime() === newestDate;
      g.oldest = g.DateObj.getTime() === oldestDate;
    });
  }
}
