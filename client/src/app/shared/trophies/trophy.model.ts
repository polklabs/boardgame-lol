import { GetRandom, TagEntity, UnicodeToEmoji } from 'libs/index';
import { ApiService } from '../services/api.service';

export abstract class ITrophy {
  private _emojis: string[];
  private _title: string;
  private _subtitles: string[];
  private _formula?: string;

  sortOrder: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: any[] = [];
  value: number = 0;
  showValue = true;
  showArray = true;

  // Calculated Values
  emoji = '';
  title = '';
  subtitle = '';
  formula?: string;

  extra: Record<string, string | number> = {};

  constructor(sortOrder: number | null, emoji: string[], title: string, subtitle: string[], formula: string) {
    this.sortOrder = sortOrder;
    this._emojis = emoji;
    this._title = title;
    this._subtitles = subtitle;
    this._formula = formula;
  }

  abstract calculate(api: ApiService): void;

  isTag(arrayItem: unknown) {
    return arrayItem instanceof TagEntity;
  }

  update(api: ApiService) {
    this.value = 0;
    this.array = [];
    this.calculate(api);
  }

  export() {
    this.extra['value'] = this.value;

    this.emoji = this.textReplace(GetRandom(this._emojis) ?? '');
    if (this.emoji.includes('U+')) {
      this.emoji = UnicodeToEmoji(this.emoji);
    } else {
      // Continue
    }

    this.title = this.textReplace(this._title);
    this.subtitle = this.textReplace(GetRandom(this._subtitles) ?? '');
    this.formula = this._formula ? this.textReplace(this._formula) : undefined;

    return this;
  }

  textReplace(text: string): string {
    for (const key of Object.keys(this.extra)) {
      text = text.replaceAll(`{${key}}`, `${this.extra[key]}`);
    }
    return text;
  }

  applyValues<T>(objects: Map<T, number>, limit = 0) {
    this.value = [...objects.values()].reduce((prev, curr) => Math.max(prev, curr), 0);
    this.array = [...objects.entries()].filter((x) => x[1] > 0 && x[1] === this.value).map((x) => x[0]);

    if (limit > 0 && this.array.length > limit) {
      this.array = [];
    } else {
      // Continue
    }
  }
}
