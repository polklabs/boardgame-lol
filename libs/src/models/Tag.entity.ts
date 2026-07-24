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

export const TagCategories = ['character', 'faction', 'role', 'victory-method', 'death-cause', 'version', 'event'] as const;
export type TagCategory = (typeof TagCategories)[number];
export const TagCategoryMapping: Record<
  TagCategory,
  {
    text: string;
    DisplayOnBoardGames?: boolean;
    DisplayOnGames?: boolean;
    DisplayOnPlayerGames?: boolean;
    DisplayOnPlayers?: boolean;
  }
> = {
  character: { text: 'Character', DisplayOnPlayerGames: true },
  faction: { text: 'Faction', DisplayOnPlayerGames: true },
  role: { text: 'Role', DisplayOnPlayerGames: true },
  'victory-method': { text: 'Victory Method', DisplayOnPlayerGames: true },
  'death-cause': { text: 'Cause of Death', DisplayOnPlayerGames: true },
  event: { text: 'Game Events', DisplayOnGames: true },
  version: { text: 'Version', DisplayOnGames: true },
} as const;

export const DISPLAY_FIELDS = [
  'DisplayOnBoardGames',
  'DisplayOnGames',
  'DisplayOnPlayerGames',
  'DisplayOnPlayers',
] as const;

@TableName('Tag')
export class TagEntity extends BaseEntity implements ITag {
  @PrimaryKey()
  TagId: string = '';

  @SecondaryKey
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

  // Tag restrictions
  DisplayOnBoardGames = true;
  DisplayOnGames = true;
  DisplayOnPlayerGames = true;
  DisplayOnPlayers = true;

  constructor(partial: Partial<TagEntity> = {}, copyIgnored = false) {
    super(partial, TagEntity);
    this.assign(partial, TagEntity, copyIgnored);
  }

  @Ignore()
  BackgroundColor: string = '';

  @Ignore()
  calculated = false;

  calculate() {
    this.BackgroundColor = getAccessibleBackground(this.Color ?? '');
    this.calculated = true;
  }

  updateCategory() {
    if (this.Category) {
      DISPLAY_FIELDS.forEach((field) => {
        this[field] = TagCategoryMapping[this.Category as TagCategory][field] === true;
      });
    } else {
      // Skip
    }
  }
}
