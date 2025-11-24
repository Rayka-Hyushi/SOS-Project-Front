import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UsuarioPerfilDTO} from '../models/usuario';
import {ActivatedRoute, Router} from '@angular/router';
import {env} from '../../environment/environment';
import {Observable} from 'rxjs';
import {LoginResponse} from '../models/login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'TOKEN_KEY';
  private readonly USER_KEY = 'USER_KEY';

  constructor(private httpClient: HttpClient, private router: Router, private route: ActivatedRoute) {
  }

  login(login: string, senha: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(env.apiUrl + "/login", {login, senha});
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    const user = this.userFromToken(token);
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  setUserProfile(profile: UsuarioPerfilDTO) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLogged(): boolean {
    return !!this.getToken();
  }

  getUser(): UsuarioPerfilDTO | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      return JSON.parse(userJson) as UsuarioPerfilDTO;
    }
    return null;
  }

  private userFromToken(token: string): UsuarioPerfilDTO | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const decoded = JSON.parse(atob(payload));
      console.log('Decoded JWT payload:', decoded);
      return {
        uuid: decoded.sub ?? undefined,
        name: decoded.name ?? undefined,
        email: decoded.sub ?? undefined,
        photo: decoded.photo ?? undefined,
      } as UsuarioPerfilDTO;
    } catch (e) {
      return null;
    }
  }

  redirect() {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || '/home';
      this.router.navigateByUrl(returnUrl);
    });
  }
}
