import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array',
  standalone: false,
})
export class ArrayPipe implements PipeTransform {
  transform<T>(value: T[] | undefined, keys: string | string[]): string {
    if (value === undefined || !Array.isArray(value)) {
      return '';
    } else if (keys) {
      // Continue
    } else {
      return value.join(', ');
    }

    if (Array.isArray(keys)) {
      // continue
    } else {
      keys = [keys];
    }

    for (const key of keys) {
      const props = key.split('.');
      const toReturn = value
        .map((item) => {
          props.forEach((k) => {
            item = (item as never)[k];
          });
          return item;
        })
        .filter((val) => val !== undefined && val !== null)
        .sort((a, b) => `${a}`.localeCompare(`${b}`))
        .join(', ');
      if (toReturn) {
        return toReturn;
      } else {
        // Continue
      }
    }
    return '';
  }
}
