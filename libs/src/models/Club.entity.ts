import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_LONG, CHARACTER_LIMIT_TINY, HEX_REGEX } from '../constants';
import { Sanitize } from '../decorators/sanitize.decorator';
import { GameEntity } from './Game.entity';
import { PlayerGameEntity } from './PlayerGame.entity';
import { BoardGameEntity } from './BoardGame.entity';
import { PlayerEntity } from './Player.entity';
import { TagEntity } from './Tag.entity';
import { TagBoardGameEntity } from './TagBoardGame.entity';
import { TagGameEntity } from './TagGame.entity';
import { TagPlayerEntity } from './TagPlayer.entity';
import { TagPlayerGameEntity } from './TagPlayerGame.entity';
import { PlayerGamePlayerEntity } from './PlayerGamePlayer.entity';
import { Ignore } from '../decorators/ignore.decorator';
import { Pattern } from '../decorators/pattern.decorator';
import { getAccessibleBackground } from '../utils/color-utils';

export type ClubReturn = {
  Club: ClubEntity;
  Games: GameEntity[];
  PlayerGames: PlayerGameEntity[];
  PlayerGamePlayers: PlayerGamePlayerEntity[];
  BoardGames: BoardGameEntity[];
  Players: PlayerEntity[];
  Tags: TagEntity[];
  TagBoardGames: TagBoardGameEntity[];
  TagGames: TagGameEntity[];
  TagPlayers: TagPlayerEntity[];
  TagPlayerGames: TagPlayerGameEntity[];
};

@TableName('Club')
export class ClubEntity extends BaseEntity {
  @PrimaryKey()
  ClubId: string = '';

  @MinMax(1, CHARACTER_LIMIT_TINY, 'string')
  @Sanitize()
  Name: string = '';

  Public: boolean = false;

  @Nullable()
  @Sanitize()
  @MinMax(0, CHARACTER_LIMIT_LONG, 'string')
  Summary: string | null = null;

  @Sanitize()
  @Nullable()
  Font: string | null = null;

  @Sanitize()
  @Nullable()
  @Pattern(HEX_REGEX, 'hex color in the format: #FFFFFF')
  Color: string | null = null;

  @Ignore()
  BackgroundColor: string = '';

  @Ignore()
  calculated = false;

  constructor(partial: Partial<ClubEntity> = {}, copyIgnored = false) {
    super(partial, ClubEntity);
    this.assign(partial, ClubEntity, copyIgnored);
  }

  calculate(): void {
    this.BackgroundColor = getAccessibleBackground(this.Color ?? '');
    this.calculated = true;
  }
}
