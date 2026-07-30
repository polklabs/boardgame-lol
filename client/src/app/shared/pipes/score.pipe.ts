import { DecimalPipe } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { BoardGameEntity } from 'libs/index';

@Pipe({
  name: 'score',
})
export class ScorePipe implements PipeTransform {
  private _locale = inject(LOCALE_ID);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any, boardGame?: BoardGameEntity | null): string {
    if (
      value === null ||
      value === undefined ||
      boardGame?.ScoreType !== 'points' ||
      value === Infinity ||
      value === -Infinity
    ) {
      return '';
    } else {
      const num = new DecimalPipe(this._locale).transform(value, '1.0-3');
      return `${boardGame?.ScorePrefix ?? ''}${num}${boardGame?.ScoreSuffix ?? ''}`;
    }
  }
}
