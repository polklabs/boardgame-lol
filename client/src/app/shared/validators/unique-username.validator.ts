import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, delay, from, map, of, switchMap } from 'rxjs';
import { HttpService } from '../services/http.service';

export function usernameUnique(httpService: HttpService, updateIconCallback: (icon: string) => void): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    updateIconCallback('pi pi-spin pi-spinner');
    return of(control.value).pipe(
      delay(500),
      switchMap((username) => {
        updateIconCallback('pi pi-spin pi-spinner');
        return from(httpService.get<boolean>(['auth', 'username_check', username], false)).pipe(
          map((isAvail) => {
            updateIconCallback(isAvail ? 'pi pi-check' : 'pi pi-times');
            return isAvail ? null : { unavailable: true };
          }),
          catchError(() => of(null)),
        );
      }),
    );
  };
}
