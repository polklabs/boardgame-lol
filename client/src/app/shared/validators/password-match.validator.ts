import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const g = control.parent as FormGroup;
    if (g === null) {
      return null;
    } else {
      // continue
    }
    if (g.get('Password')?.value === null || g.get('PasswordRetry')?.value === null) {
      return null;
    } else {
      return g.get('Password')?.value === g.get('PasswordRetry')?.value ? null : { mismatch: true };
    }
  };
}
