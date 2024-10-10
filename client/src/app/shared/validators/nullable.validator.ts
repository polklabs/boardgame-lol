import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getNullable, getPrimaryKey, getSecondaryKey } from 'libs/index';

export function nullableValidator<T>(entityType: { new (partial: Partial<T>): T }, propertyKey: keyof T): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const pk = getPrimaryKey(entityType);
    const sk = getSecondaryKey(entityType);

    // PK and SK are allowed to be null,
    // DB will throw error if it hasn't been filled in before saving
    if (propertyKey === pk || propertyKey === sk) {
      return null;
    } else {
      // continue
    }

    const isNullable = getNullable(entityType).includes(String(propertyKey));

    if (!isNullable) {
      return value === null || value === undefined || value === '' ? { nullable: true } : null;
    } else {
      return null;
    }
  };
}
