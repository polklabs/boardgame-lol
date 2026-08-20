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
  'generic',
  'player',
  'play',
  'score',
  'game',

  // Specific
  'character',
  'meta-character',
  'faction',
  'role',
  'victory-method',
  'death-cause',
  'loss-cause',
  'version',
  'event',
  'theme',
] as const;
export type TagCategory = (typeof TagCategories)[number];
export const TagCategoryMapping: Record<
  TagCategory,
  {
    text: string;
    info: string;
    OnBoardGames?: boolean;
    OnGames?: boolean;
    OnPlayerGames?: boolean;
    OnPlayers?: boolean;
  }
> = {
  generic: {
    text: 'General',
    info: 'Display on all editors',
    OnBoardGames: true,
    OnGames: true,
    OnPlayerGames: true,
    OnPlayers: true,
  },
  player: { text: 'Player', info: 'Only display on player editor', OnPlayers: true },
  play: { text: 'Play', info: 'Only display on play editor', OnGames: true },
  score: { text: 'Play Score', info: 'Only display on score editor', OnPlayerGames: true },
  game: { text: 'Game', info: 'Only display on game editor', OnBoardGames: true },

  character: { text: 'Character', info: 'Ex: Werewolf, Prof. Plum, Tophat', OnPlayerGames: true },
  'meta-character': {
    text: 'Meta Character',
    info: "When you're a dude playing a dude disguised as another dude",
    OnPlayerGames: true,
  },
  faction: { text: 'Faction', info: 'Ex: Villagers', OnPlayerGames: true },
  role: { text: 'Role', info: 'Ex: Host, Game Master, Bank, Score keeper', OnPlayerGames: true },
  'victory-method': { text: 'Victory Method', info: 'Ex: Longest Road', OnPlayerGames: true, OnGames: true },
  'death-cause': { text: 'Cause of Death', info: 'Ex: Suffocation, Alien Queen', OnPlayerGames: true, OnGames: true },
  'loss-cause': { text: 'Cause of Loss', info: 'Ex: No Money, Voted Out', OnPlayerGames: true, OnGames: true },
  event: { text: 'Game Events', info: '', OnGames: true },
  version: { text: 'Version', info: 'Non-vanilla expansion/edition', OnGames: true, OnBoardGames: true },
  theme: { text: 'Theme', info: 'Ex: Halloween, Christmas, Horror', OnGames: true, OnBoardGames: true },
} as const;

export const DISPLAY_FIELDS = ['OnBoardGames', 'OnGames', 'OnPlayerGames', 'OnPlayers'] as const;

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
  Category: TagCategory = 'generic';

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
