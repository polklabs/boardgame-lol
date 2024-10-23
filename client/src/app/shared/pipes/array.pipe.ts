import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array',
})
export class ArrayPipe implements PipeTransform {
  transform(value: never[], key: string): string {
    if (!Array.isArray(value)) {
      return '';
    } else if (!key) {
      return value.join(', ');
    } else {
      // Continue
    }

    const keys = key.split('.');
    return value
      .map((item) => {
        keys.forEach((k) => {
          item = item[k];
        });
        return item;
      })
      .filter((val) => val !== undefined && val !== null)
      .join(', ');
  }
}
