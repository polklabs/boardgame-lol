import { BoardGameEntity, GameEntity, GetRandom, PlayerEntity, UnicodeToEmoji } from 'libs/index';

export type Trophy = {
  emoji: string;
  title: string;
  subtitle: string;
  formula?: string;
  value: number;
  array: unknown[];
  showValue: boolean;
};

export type ApplyObj = { item: unknown; count: number }[];

export abstract class ITrophy {
  emoji: string[];
  title: string;
  subtitle: string[];
  formula?: string;
  sortOrder: number | null;
  array: unknown[] = [];
  value: number = 0;
  showValue = true;

  extra: Record<string, string | number> = {};

  constructor(sortOrder: number | null, emoji: string[], title: string, subtitle: string[], formula?: string) {
    this.sortOrder = sortOrder;
    this.emoji = emoji;
    this.title = title;
    this.subtitle = subtitle;
    this.formula = formula;
  }

  abstract calculate(players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]): void;

  update(players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]) {
    this.value = 0;
    this.array = [];
    this.calculate(players, games, boardGames);
  }

  export(): Trophy {
    this.extra['value'] = this.value;

    let emoji = this.textReplace(GetRandom(this.emoji) ?? '');
    if (emoji.includes('U+')) {
      emoji = UnicodeToEmoji(emoji);
    } else {
      // Continue
    }

    return {
      emoji,
      title: this.textReplace(this.title),
      subtitle: this.textReplace(GetRandom(this.subtitle) ?? ''),
      formula: this.formula ? this.textReplace(this.formula) : undefined,
      value: this.value ?? 0,
      array: this.array ?? [],
      showValue: this.showValue,
    };
  }

  textReplace(text: string): string {
    for (const key of Object.keys(this.extra)) {
      text = text.replaceAll(`{${key}}`, `${this.extra[key]}`);
    }
    return text;
  }

  applyValues(objects: ApplyObj) {
    this.value = objects.reduce((prev, curr) => Math.max(prev, curr.count), 0);
    this.array = objects.filter((x) => x.count > 0 && x.count === this.value).map((x) => x.item);
  }
}
