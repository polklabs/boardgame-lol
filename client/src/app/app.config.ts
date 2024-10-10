import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from '../environments/environment';

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
          allowedDomains: [environment.baseUrl],
          disallowedRoutes: [],
        },
      }),
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
    MessageService,
    ConfirmationService,
  ],
};
