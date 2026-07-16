import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getMinMax } from 'libs/index';

export function minMaxValidator<T>(entityType: new (partial: Partial<T>) => T, propertyKey: keyof T): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === undefined || value === '' || value === null) {
      return null;
    } else {
      // continue
    }

    const minMax = getMinMax(entityType)[String(propertyKey)];

    if (minMax) {
      let minMaxValid = true;
      if (
        (minMax.type === 'string' && typeof value === 'string') ||
        (minMax.type === 'array' && Array.isArray(value))
      ) {
        minMaxValid = value.length >= minMax.min && value.length <= minMax.max;
      } else if (minMax.type === 'number') {
        minMaxValid = +value >= minMax.min && +value <= minMax.max;
      } else {
        console.warn(`${String(propertyKey)}: ${minMax.type} cannot have MinMax decorator`);
      }
      return minMaxValid ? null : { minMax: true };
    } else {
      return null;
    }
  };
}
