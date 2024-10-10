import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, from, map, of } from 'rxjs';

export function passwordCommonValidator(commonPasswords: Promise<string[] | null>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (control.value === null || control.value === '') {
      return of(null);
    } else {
      return from(commonPasswords).pipe(
        map((passwords) => {
          return (passwords ?? []).includes(control.value) ? { passwordCommon: true } : null;
        }),
        catchError(() => of(null)),
      );
    }
  };
}
