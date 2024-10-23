import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, firstValueFrom, map, of } from 'rxjs';
import { MessageService } from 'primeng/api';

type URL = (string | number | null | undefined)[];

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl = environment.baseUrl;
  private loadingSpinner = 0;

  readonly loadingSpinner$ = new BehaviorSubject(false);

  constructor(
    private httpClient: HttpClient,
    private messageService: MessageService,
  ) {}

  get<T>(url: URL, showSpinner = true) {
    this.addSpinner(showSpinner);
    return firstValueFrom(
      this.httpClient.get<T>(this.buildUrl(url.join('/'))).pipe(
        map((x) => {
          this.removeSpinner(showSpinner);
          return x;
        }),
        catchError((error) => this.handleError(showSpinner, error)),
      ),
    );
  }

  post<T, K = T>(url: URL, data: T, showSpinner = true) {
    this.addSpinner(showSpinner);
    return firstValueFrom(
      this.httpClient.post<K>(this.buildUrl(url.join('/')), data).pipe(
        map((x) => {
          this.removeSpinner(showSpinner);
          return x;
        }),
        catchError((error) => this.handleError(showSpinner, error)),
      ),
    );
  }

  put<T, K = T>(url: URL, data: T, showSpinner = true) {
    this.addSpinner(showSpinner);
    return firstValueFrom(
      this.httpClient.put<K>(this.buildUrl(url.join('/')), data).pipe(
        map((x) => {
          this.removeSpinner(showSpinner);
          return x;
        }),
        catchError((error) => this.handleError(showSpinner, error)),
      ),
    );
  }

  patch<T, K = T>(url: URL, data: T, showSpinner = true) {
    this.addSpinner(showSpinner);
    return firstValueFrom(
      this.httpClient.patch<K>(this.buildUrl(url.join('/')), data).pipe(
        map((x) => {
          this.removeSpinner(showSpinner);
          return x;
        }),
        catchError((error) => this.handleError(showSpinner, error)),
      ),
    );
  }

  delete(url: URL, showSpinner = true) {
    this.addSpinner(showSpinner);
    return firstValueFrom(
      this.httpClient.delete(this.buildUrl(url.join('/'))).pipe(
        map((x) => {
          this.removeSpinner(showSpinner);
          return x;
        }),
        catchError((error) => this.handleError(showSpinner, error)),
      ),
    );
  }

  private buildUrl(url: string) {
    return `${this.baseUrl}/${url}`;
  }

  private addSpinner(showSpinner: boolean) {
    if (showSpinner === true) {
      this.loadingSpinner++;
      this.loadingSpinner$.next(this.loadingSpinner > 0);
    } else {
      // nothing
    }
  }

  private removeSpinner(showSpinner: boolean) {
    if (showSpinner === true) {
      this.loadingSpinner--;
      this.loadingSpinner$.next(this.loadingSpinner > 0);
    } else {
      // nothing
    }
  }

  private handleError(showSpinner: boolean, error: HttpErrorResponse) {
    this.removeSpinner(showSpinner);
    console.log(error);
    if (error.status === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'API may be offline, please try again later.',
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message });
    }
    return of(null);
  }
}
