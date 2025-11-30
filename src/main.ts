import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {App} from './app/app';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/security/auth-interceptor';
import {errorInterceptor} from './core/security/error-interceptor';
import {NotificationService} from './core/services/notification-service';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
})
  .then((appRef) => {
    try {
      const injector = appRef.injector;
      const notificationService = injector.get(NotificationService);
    } catch (e) {}
  })
  .catch((err) => console.error(err));
