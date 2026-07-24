import { Pipe, PipeTransform } from '@angular/core';
import { isEmptyLike } from '../helpers/data.helper';

@Pipe({
  name: 'hide',
})
export class HidePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform<T>(value: T): T | '' {
    return isEmptyLike(value) ? '' : value;
  }
}
