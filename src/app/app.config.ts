import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  Provider,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from '../core/security/auth-interceptor';
import {env} from '../environment/environment';

export const ENV: Provider = {
  provide: 'ENV',
  useValue: env
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    ENV
  ]
};
