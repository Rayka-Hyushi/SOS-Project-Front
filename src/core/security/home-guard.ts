import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const homeGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Se está logado, permite o acesso
  if (auth.isLogged()) {
    return true;
  }

  // Se não está logado, redireciona para a página de login com o returnUrl
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
