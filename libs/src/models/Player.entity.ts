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

export type PlayerReturn = {
  Player: PlayerEntity;
  TagPlayers: TagPlayerEntity[];
};

@TableName('Player')
export class PlayerEntity extends BaseEntity {
  @PrimaryKey()
  PlayerId: string = '';

  @SecondaryKey
  ClubId: string = '';

  @MinMax(1, CHARACTER_LIMIT_TINY, 'string')
  @Sanitize()
  Name: string = '';

  @Nullable()
  @MinMax(1, CHARACTER_LIMIT_BYTE * 4, 'string')
  @Sanitize()
  Nickname: string | null = null;

  IsRealPerson: boolean = true;

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
  BestGames: BoardGameEntity[] = [];

  @Ignore()
  BestGameWins: number = 0;

  @Ignore()
  FirstSeen?: Date | string;

  @Ignore()
  ShortName?: string;

  @Ignore()
  hasMostWins: boolean = false;

  @Ignore()
  calculated = false;

  constructor(partial: Partial<PlayerEntity> = {}, copyIgnored = false) {
    super(partial, PlayerEntity);
    this.assign(partial, PlayerEntity, copyIgnored);
    this.Tags = partial.Tags ?? [];
  }

  calculate() {
    this.calculateWins();
    this.calculateBestGames();
    this.calculateBestGameWins();
    this.calculateFirstSeen();
    this.calculated = true;
  }

  calculateWins() {
    calculationsComplete(this.PlayerGames.map((x) => x.Game));
    this.Wins = this.PlayerGames.filter((pg) => pg.Game?.place(0).includes(pg)).reverse();
    this.WinCount = this.Wins.length;
    this.LossCount = this.PlayerGames.length - this.WinCount;
  }

  calculateBestGames() {
    this.BestGames = Mode(
      this.Wins.filter((x) => x.Game).map((x) => x.Game!.BoardGame!),
      (x) => x.BoardGameId,
    ).filter(Boolean);
  }

  calculateBestGameWins() {
    if (this.BestGames.length > 0) {
      this.BestGameWins = this.Wins.reduce((count, win) => {
        return win.Game?.BoardGameId === this.BestGames[0].BoardGameId ? count + 1 : count;
      }, 0);
    } else {
      this.BestGameWins = 0;
    }
  }

  calculateFirstSeen() {
    const minDate = Math.min(
      ...this.PlayerGames.filter((pg) => pg.Game).map((pg) => new Date(pg.Game!.DateObj).getTime()),
    );
    if (minDate === Infinity) {
      this.FirstSeen = undefined;
    } else {
      this.FirstSeen = new Date(minDate);
    }
  }

  static postCalculate(players: PlayerEntity[]) {
    const maxWins = Math.max(...players.map((x) => x.Wins.length));

    players.forEach((p) => {
      p.ShortName = p.Nickname || '';
      if (players.some((x) => x.PlayerId !== p.PlayerId && x.Name?.startsWith(p.ShortName!))) {
        p.ShortName = p.Name.split(' ')[0];
      } else {
        // continue
      }

      if (players.some((x) => x.PlayerId !== p.PlayerId && x.Name?.startsWith(p.ShortName!))) {
        p.ShortName = p.Name;
      } else {
        // continue
      }

      p.hasMostWins = p.Wins.length > 0 && p.Wins.length >= maxWins;
    });
  }
}
