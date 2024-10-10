import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getEnum } from 'libs/index';

export function enumValidator<T>(entityType: { new (partial: Partial<T>): T }, propertyKey: keyof T): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === undefined || value === '') {
      return null;
    } else {
      // continue
    }

    const enumValue = getEnum(entityType)[String(propertyKey)];

    if (enumValue) {
      return !enumValue.includes(value) ? { enum: true } : null;
    } else {
      return null;
    }
  };
}
