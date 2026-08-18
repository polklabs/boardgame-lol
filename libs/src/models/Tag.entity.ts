import { BaseEntity } from './Base.entity';
import { TableName } from '../decorators/table-name.decorator';
import { PrimaryKey } from '../decorators/primary-key.decorator';
import { SecondaryKey } from '../decorators/secondary-key.decorator';
import { MinMax } from '../decorators/min-max.decorator';
import { CHARACTER_LIMIT_TINY, HEX_REGEX } from '../constants';
import { Sanitize } from '../decorators/sanitize.decorator';
import { ITag } from './ITag';
import { Nullable } from '../decorators/nullable.decorator';
import { Ignore } from '../decorators/ignore.decorator';
import { getAccessibleBackground } from '../utils/color-utils';
import { Pattern } from '../decorators/pattern.decorator';
import { Enum } from '../decorators/enum.decorator';
import { Exclude } from 'class-transformer';
import { TagBoardGameEntity } from './TagBoardGame.entity';

export type TagReturn = {
  Tag: TagEntity;
  TagBoardGames: TagBoardGameEntity[];
};

export const TagCategories = [
  // Generic
  'player',
  'play',
  'score',
  'game',

  // Specific
  'character',
  'faction',
  'role',
  'victory-method',
  'death-cause',
  'version',
  'event',
] as const;
export type TagCategory = (typeof TagCategories)[number];
export const TagCategoryMapping: Record<
  TagCategory | '',
  {
    text: string;
    OnBoardGames?: boolean;
    OnGames?: boolean;
    OnPlayerGames?: boolean;
    OnPlayers?: boolean;
  }
> = {
  '': { text: '', OnBoardGames: true, OnGames: true, OnPlayerGames: true, OnPlayers: true },
  player: { text: 'Player', OnPlayers: true },
  play: { text: 'Play', OnGames: true },
  score: { text: 'Play Score', OnPlayerGames: true },
  game: { text: 'Game', OnBoardGames: true },

  character: { text: 'Character', OnPlayerGames: true },
  faction: { text: 'Faction', OnPlayerGames: true },
  role: { text: 'Role', OnPlayerGames: true },
  'victory-method': { text: 'Victory Method', OnPlayerGames: true },
  'death-cause': { text: 'Cause of Death', OnPlayerGames: true },
  event: { text: 'Game Events', OnGames: true },
  version: { text: 'Version', OnGames: true },
} as const;

export const DISPLAY_FIELDS = [
  'OnBoardGames',
  'OnGames',
  'OnPlayerGames',
  'OnPlayers',
] as const;

@TableName('Tag')
export class TagEntity extends BaseEntity implements ITag {
  @PrimaryKey()
  TagId: string = '';

  @SecondaryKey
  @Exclude()
  ClubId: string = '';

  @Nullable()
  @Pattern(HEX_REGEX, 'hex color in the format: #FFFFFF')
  Color: string | null = null;

  @MinMax(1, CHARACTER_LIMIT_TINY, 'string')
  @Sanitize()
  Text: string = '';

  @Enum(TagCategories)
  @Nullable()
  Category: TagCategory | null = null;

  constructor(partial: Partial<TagEntity> = {}, copyIgnored = false) {
    super();
    this.assign(partial, TagEntity, copyIgnored);
    this.BoardGameFilter = partial.BoardGameFilter ?? [];

    const mapping = TagCategoryMapping[this.Category ?? ''];
    this.OnBoardGames = mapping.OnBoardGames ?? false;
    this.OnGames = mapping.OnGames ?? false;
    this.OnPlayerGames = mapping.OnPlayerGames ?? false;
    this.OnPlayers = mapping.OnPlayers ?? false;
  }

  @Ignore()
  BackgroundColor: string = '';

  @Ignore()
  BoardGameFilter: string[] = [];

  // Tag restrictions
  @Ignore()
  OnBoardGames = true;
  @Ignore()
  OnGames = true;
  @Ignore()
  OnPlayerGames = true;
  @Ignore()
  OnPlayers = true;

  @Ignore()
  calculated = false;

  calculate() {
    this.BackgroundColor = getAccessibleBackground(this.Color ?? '');
    if (this.BoardGameFilter.length > 0) {
      this.OnPlayers = false;
    }
    this.calculated = true;
  }
}
