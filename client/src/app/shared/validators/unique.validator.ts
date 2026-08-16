import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BaseEntity } from 'libs/index';
import { EntityWrapper } from '../models/entity-wrapper';

export function uniqueValidator<T extends BaseEntity>(entityWrapper: EntityWrapper<T>, fg: FormGroup): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = `${control.value}`.toLowerCase().trim();
    const controlId = Object.keys(fg.controls).find((k) => fg.controls[k] === control);
    const id = entityWrapper.getId(fg.getRawValue());

    if (value && controlId) {
      // Continue
    } else {
      return null;
    }

    const extraCount = entityWrapper.raw.reduce(
      (prev, curr) =>
        prev +
        (`${(curr as Record<string, unknown>)[controlId]}`.toLowerCase().trim() === value &&
        id !== entityWrapper.getId(curr)
          ? 1
          : 0),
      0,
    );

    return extraCount > 0 ? { unique: true } : null;
  };
}
