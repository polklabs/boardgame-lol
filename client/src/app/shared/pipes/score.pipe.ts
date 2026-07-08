import { Pipe, PipeTransform } from '@angular/core';
import { BoardGameEntity } from 'libs/index';

@Pipe({
  name: 'score',
})
export class ScorePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any, boardGame: BoardGameEntity): string {
    return `${boardGame.ScorePrefix ?? ''}${value}${boardGame.ScoreSuffix ?? ''}`;
  }
}
