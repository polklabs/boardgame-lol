import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getPattern } from 'libs/index';

export function patternValidator<T>(entityType: new (partial: Partial<T>) => T, propertyKey: keyof T): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === undefined || value === '' || value === null) {
      return null;
    } else {
      // continue
    }

    const pattern = getPattern(entityType)[String(propertyKey)];

    if (pattern) {
      const patternValid = new RegExp(pattern.regex).exec(value);
      return patternValid ? null : { pattern: true };
    } else {
      return null;
    }
  };
}
