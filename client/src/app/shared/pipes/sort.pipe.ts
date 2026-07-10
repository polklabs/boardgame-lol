import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform<T>(value: T[] | undefined, key: string = ''): T[] {
    if (value === undefined || !Array.isArray(value)) {
      return value as never;
    } else {
      // Continue
    }

    if (key === '') {
      return value.sort((a, b) => `${a}`.localeCompare(`${b}`));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return value.sort((a: any, b: any) => `${a[key]}`.localeCompare(`${b[key]}`));
    }
  }
}
