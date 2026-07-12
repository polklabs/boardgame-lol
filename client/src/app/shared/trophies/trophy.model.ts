import { BoardGameEntity, GameEntity, GetRandom, PlayerEntity, UnicodeToEmoji } from 'libs/index';

export type Trophy = {
  emoji: string;
  title: string;
  subtitle: string;
  value: number;
  array: unknown[];
};

export abstract class ITrophy {
  emoji: string;
  title: string;
  subtitle: string[];
  formula?: string;
  array: unknown[] = [];
  value: number = 0;

  extra: Record<string, string | number> = {};

  constructor(emoji: string, title: string, subtitle: string[], formula?: string) {
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

    let emoji = this.textReplace(this.emoji);
    if (emoji.includes('U+')) {
      emoji = UnicodeToEmoji(emoji);
    } else {
      // Continue
    }

    return {
      emoji,
      title: this.textReplace(this.title),
      subtitle: this.textReplace(GetRandom(this.subtitle) ?? ''),
      value: this.value ?? 0,
      array: this.array ?? [],
    };
  }

  textReplace(text: string): string {
    const regex = /\{(.+?)\}/gm;
    const result = text.replaceAll(regex, (_, g1: string) => {
      if (g1 in this.extra) {
        return `${this.extra[g1] ?? ''}`;
      } else {
        return '';
      }
    });

    return result;
  }
}
