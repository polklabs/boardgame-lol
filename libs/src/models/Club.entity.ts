import { TableName } from '../decorators/table-name.decorator';
import { BaseEntity } from './Base.entity';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { Nullable } from '../decorators/nullable.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_LONG, CHARACTER_LIMIT_SHORT } from '../constants';
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

  @MinMax(1, CHARACTER_LIMIT_SHORT, 'string')
  @Sanitize()
  Name: string = '';

  Public: boolean = false;

  @Nullable()
  @Sanitize()
  @MinMax(0, CHARACTER_LIMIT_LONG, 'string')
  Summary: string | null = null;

  constructor(partial: Partial<ClubEntity> = {}, copyIgnored = false) {
    super(partial, ClubEntity);
    this.assign(partial, ClubEntity, copyIgnored);
  }

  calculate(): void {
    this.calculated = true;
  }
}
