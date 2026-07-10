import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hide',
})
export class HidePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any, key: string): any | string {
    return `${value}` === key ? '' : value;
  }
}
