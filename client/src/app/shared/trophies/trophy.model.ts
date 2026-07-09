import { BoardGameEntity, GameEntity, PlayerEntity, UnicodeToEmoji } from 'libs/index';

export type Trophy = {
  emoji: string;
  title: string;
  info: string;
  value: number;
  array: unknown[];
};

export abstract class ITrophy {
  emoji: string;
  title: string;
  info: string;
  array: unknown[] = [];
  value: number = 0;

  extra: Record<string, string | number> = {};

  constructor(emoji: string, title: string, info: string) {
    this.emoji = emoji;
    this.title = title;
    this.info = info;
  }

  abstract calculate(players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]): void;

  update(players: PlayerEntity[], games: GameEntity[], boardGames: BoardGameEntity[]) {
    this.calculate(players, games, boardGames);
  }

  export(): Trophy {
    let emoji = this.textReplace(this.emoji);
    if (emoji.includes('U+')) {
      emoji = UnicodeToEmoji(emoji);
    } else {
      // Continue
    }

    return {
      emoji,
      title: this.textReplace(this.title),
      info: this.textReplace(this.info),
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
