import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'map',
})
export class MapPipe implements PipeTransform {
  transform<T>(value: T | T[] | undefined, keys: string | string[]): string {
    if (value === undefined) {
      return '';
    } else if (typeof value === 'string') {
      return value;
    } else if (keys) {
      // Continue
    } else if (Array.isArray(value)) {
      return value.join(', ');
    } else {
      return `${value}`;
    }

    if (Array.isArray(keys)) {
      // continue
    } else {
      keys = [keys];
    }

    for (const key of keys) {
      const props = key.split('.');
      let toReturn;
      if (Array.isArray(value)) {
        toReturn = value
          .map((item) => {
            props.forEach((k) => {
              item = (item as never)[k];
            });
            return item;
          })
          .filter((val) => val !== undefined && val !== null)
          .sort((a, b) => `${a}`.localeCompare(`${b}`))
          .join(', ');
      } else {
        let item = value;
        props.forEach((k) => {
          item = (item as never)[k];
        });
        toReturn = item ? `${item}` : undefined;
      }
      if (toReturn) {
        return toReturn;
      } else {
        // Continue
      }
    }
    return '';
  }
}
