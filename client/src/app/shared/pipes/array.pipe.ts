import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array',
})
export class ArrayPipe implements PipeTransform {
  transform<T>(value: T[] | undefined, key: string): string {
    if (value === undefined || !Array.isArray(value)) {
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
          item = (item as never)[k];
        });
        return item;
      })
      .filter((val) => val !== undefined && val !== null)
      .sort((a, b) => `${a}`.localeCompare(`${b}`))
      .join(', ');
  }
}
