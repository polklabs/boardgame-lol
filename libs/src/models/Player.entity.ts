import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity, calculationsComplete } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_BYTE, CHARACTER_LIMIT_TINY } from '../constants';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Sanitize } from '../decorators/sanitize.decorator';
import { Ignore } from '../decorators/ignore.decorator';
import { PlayerGameEntity } from './PlayerGame.entity';
import { BoardGameEntity } from './BoardGame.entity';
import { Mode } from '../utils/helper-utils';
import { TagEntity } from './Tag.entity';
import { TagPlayerEntity } from './TagPlayer.entity';
import { Nullable } from '../decorators/nullable.decorator';
import { Enum } from '../decorators/enum.decorator';
import { Exclude } from 'class-transformer';

export type PlayerReturn = {
  Player: PlayerEntity;
  TagPlayers: TagPlayerEntity[];
};

export const NameShortenings = ['first', 'middle', 'last', 'full', 'custom'] as const;
export type NameShortening = (typeof NameShortenings)[number];

@TableName('Player')
export class PlayerEntity extends BaseEntity {
  @PrimaryKey()
  PlayerId: string = '';

  @SecondaryKey
  @Exclude()
  ClubId: string = '';

  @MinMax(1, CHARACTER_LIMIT_TINY, 'string')
  @Sanitize()
  Name: string = '';

  @Enum(NameShortenings)
  PreferredName: NameShortening = 'first';

  @Nullable()
  @MinMax(1, CHARACTER_LIMIT_BYTE * 4, 'string')
  @Sanitize()
  Nickname: string | null = null;

  IsRealPerson: boolean = true;

  get ScoringGames() {
    return this.PlayerGames.filter((x) => x.ScoringPlayer);
  }

  @Ignore()
  @MinMax(0, 8, 'array')
  Tags: TagEntity[] = [];

  @Ignore()
  PlayerGames: PlayerGameEntity[] = [];

  @Ignore()
  Wins: PlayerGameEntity[] = [];

  @Ignore()
  WinCount = 0;

  @Ignore()
  LossCount = 0;

  @Ignore()
  NonScoreCount = 0;

  @Ignore()
  BestGames: BoardGameEntity[] = [];

  @Ignore()
  BestGameWins: number = 0;

  @Ignore()
  WorstGames: BoardGameEntity[] = [];

  @Ignore()
  WorstGameWins: number = 0;

  @Ignore()
  FirstSeen?: Date | string;

  @Ignore()
  LastSeen?: Date | string;

  @Ignore()
  ShortName: string = '';

  @Ignore()
  FullName: string = '';

  @Ignore()
  hasMostWins: boolean = false;

  @Ignore()
  totalPoints = 0;

  @Ignore()
  calculated = false;

  constructor(partial: Partial<PlayerEntity> = {}, copyIgnored = false) {
    super();
    this.assign(partial, PlayerEntity, copyIgnored);
    this.Tags = partial.Tags ?? [];
  }

  calculate() {
    this.calculateWins();
    this.calculateBestGames();
    this.calculateWorstGames();
    this.calculateSeen();
    this.calculateTotalPoints();
    this.calculated = true;
  }

  calculateWins() {
    calculationsComplete(this.PlayerGames.map((x) => x.Game));
    this.Wins = this.ScoringGames.filter((pg) => pg.Game?.place(0).includes(pg)).reverse();
    const winIds = new Set(this.Wins.map(x => x.GameId));
    this.WinCount = winIds.size;
    this.LossCount = (new Set(this.ScoringGames.filter(x => !winIds.has(x.GameId)))).size;
    this.NonScoreCount = this.PlayerGames.filter(x => !x.ScoringPlayer).length;
  }

  calculateBestGames() {
    this.BestGames = Mode(
      this.Wins.filter((x) => x.Game).map((x) => x.Game!.BoardGame!),
      (x) => x.BoardGameId,
    ).filter(Boolean);
    if (this.BestGames.length > 0) {
      this.BestGameWins = this.Wins.reduce((count, win) => {
        return win.Game?.BoardGameId === this.BestGames[0].BoardGameId ? count + 1 : count;
      }, 0);
    } else {
      this.BestGameWins = 0;
    }
  }

  calculateWorstGames() {
    const lostGames = this.PlayerGames.filter((x) => x.Game && x.ScoringPlayer && !x.Won);
    this.WorstGames = Mode(
      lostGames.map((x) => x.Game!.BoardGame!),
      (x) => x.BoardGameId,
    ).filter(Boolean);
    if (this.WorstGames.length > 0) {
      this.WorstGameWins = lostGames.reduce((count, loss) => {
        return loss.Game?.BoardGameId === this.WorstGames[0].BoardGameId ? count + 1 : count;
      }, 0);
    } else {
      this.WorstGameWins = 0;
    }
  }

  calculateSeen() {
    const minDate = Math.min(...this.PlayerGames.map((pg) => new Date(pg.Game?.DateObj ?? Infinity).getTime()));
    const maxDate = Math.max(...this.PlayerGames.map((pg) => new Date(pg.Game?.DateObj ?? -Infinity).getTime()));
    this.FirstSeen = minDate === Infinity ? undefined : new Date(minDate);
    this.LastSeen = maxDate === -Infinity ? undefined : new Date(maxDate);
  }

  calculateTotalPoints() {
    this.totalPoints = this.ScoringGames.reduce(
      (prev, curr) => prev + (curr.Game?.ScoreType === 'points' ? (curr.Points ?? 0) : 0),
      0,
    );
  }

  static postCalculate(players: PlayerEntity[]) {
    const maxWins = Math.max(...players.map((x) => x.Wins.length));

    const nameMap = new Map<string, number>();
    players.forEach((p) => {
      const wordsArray = [...(p.Name.match(/\S+/g) ?? [])];
      if (wordsArray.length <= 1) {
        p.ShortName = p.Name;
      }
      switch (p.PreferredName) {
        case 'first':
          p.ShortName = wordsArray[0];
          break;
        case 'last':
          p.ShortName = wordsArray.at(-1) ?? p.Name;
          break;
        case 'custom':
          p.ShortName = p.Nickname ?? p.Name;
          break;
        case 'middle': {
          const middle = wordsArray.slice(1, -1);
          if (middle.length >= 1) {
            p.ShortName = middle.join(' ');
          } else {
            p.ShortName = p.Name;
          }
          break;
        }
        case 'full':
        default:
          p.ShortName = p.Name;
          break;
      }
      nameMap.set(p.ShortName, (nameMap.get(p.ShortName) ?? 0) + 1);

      p.hasMostWins = p.Wins.length > 0 && p.Wins.length >= maxWins;
    });

    players.forEach((p) => {
      if ((nameMap.get(p.ShortName) ?? 0) > 1) {
        p.ShortName = p.Name;
      }

      if (p.Nickname) {
        p.FullName = `${p.Nickname} - ${p.Name}`;
      } else {
        p.FullName = p.Name;
      }
    });
  }
}
