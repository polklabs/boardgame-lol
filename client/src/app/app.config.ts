import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from '../environments/environment';
import { providePrimeNG } from 'primeng/config';
import { LaraDark } from './preset';

export function tokenGetter() {
  return localStorage.getItem('access_token') ?? '';
}

export function tokenSetter(token: string) {
  localStorage.setItem('access_token', token);
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: environment.allowedDomains,
          disallowedRoutes: [],
        },
      }),
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: LaraDark,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
