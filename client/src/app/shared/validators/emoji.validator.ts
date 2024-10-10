import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emojiValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    } else {
      return control.value.includes('_') ? { badEmoji: true } : null;
    }
  };
}
