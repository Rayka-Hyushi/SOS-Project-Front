import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {
  }

  login(login: string, senha: string): Observable<string> {
    return this.httpClient.post<string>("http://localhost:8080/api/login", {login, senha})
  }
}
