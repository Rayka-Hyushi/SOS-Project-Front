import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UsuarioPerfilDTO, UsuarioRequestDTO} from '../models/usuario';
import {env} from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) {
  }

  createUser(usuario: UsuarioRequestDTO, photo: File): Observable<string> {
    const formData = new FormData();

    formData.append('name', usuario.name);
    formData.append('email', usuario.email);
    formData.append('pass', usuario.pass);
    formData.append('photo', photo, photo.name);

    return this.httpClient.post<string>(env.apiUrl + "/usuarios", formData, {responseType: 'text' as 'json'});
  }

  getUserProfile(): Observable<UsuarioPerfilDTO> {
    return this.httpClient.get<UsuarioPerfilDTO>(env.apiUrl + "/usuarios/perfil");
  }
}
