import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_SHORT } from '../constants';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { Sanitize } from '../decorators/sanitize.decorator';
import { Ignore } from '../decorators/ignore.decorator';
import { PlayerGameEntity } from './PlayerGame.entity';
import { BoardGameEntity } from './BoardGame.entity';
import { Mode } from '../utils/helper-utils';

@TableName('Player')
export class PlayerEntity extends BaseEntity {
  @PrimaryKey
  PlayerId: string | null = null;

  @SecondaryKey
  ClubId: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  Name: string | null = null;

  IsRealPerson: boolean = true;

  @Ignore()
  PlayerGames: PlayerGameEntity[] = [];

  @Ignore()
  Wins: PlayerGameEntity[] = [];

  @Ignore()
  BestGames: BoardGameEntity[] = [];

  @Ignore()
  BestGameWins: number = 0;

  constructor(partial: Partial<PlayerEntity> = {}, copyIgnored = false) {
    super(partial, PlayerEntity);
    this.assign(partial, PlayerEntity, copyIgnored);
  }

  calculateFields() {
    this.calculateWins();
    this.calculateBestGames();
    this.calculateBestGameWins();
  }

  calculateWins() {
    this.Wins = this.PlayerGames.filter((pg) => pg.Game?.calculateWinner().includes(pg)).sort((a, b) =>
      a.Game?.Date.toString().localeCompare(b.Game?.Date.toString() ?? '') ?? 0
    );
  }

  calculateBestGames() {
    this.BestGames = Mode(
      this.Wins.filter((x) => x.Game).map((x) => x.Game!.BoardGame!),
      (x) => x.BoardGameId ?? ''
    ).filter((x) => x);
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
}
