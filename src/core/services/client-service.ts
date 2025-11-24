import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Cliente} from '../models/cliente';
import {env} from '../../environment/environment';
import {Observable} from 'rxjs';
import {Page} from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private httpClient: HttpClient) {
  }

  createClient(cliente: Cliente): Observable<Cliente> {
    return this.httpClient.post<Cliente>(env.apiUrl + "/clientes", cliente);
  }

  getClients(nomeFiltro?: string, page: number = 0, size: number = 10): Observable<Page<Cliente>> {
    let params = new HttpParams();
    if (nomeFiltro) {
      params = params.set('nome', nomeFiltro);
    }
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());
    return this.httpClient.get<Page<Cliente>>(env.apiUrl + "/clientes", {params});
  }

  getOneClient(uuid: string): Observable<Cliente> {
    return this.httpClient.get<Cliente>(env.apiUrl + "/clientes/" + uuid);
  }

  updateClient(uuid: string, cliente: Cliente): Observable<Cliente> {
    return this.httpClient.put<Cliente>(env.apiUrl + "/clientes/" + uuid, cliente);
  }

  deleteClient(uuid: string): Observable<void> {
    return this.httpClient.delete<void>(env.apiUrl + "/clientes/" + uuid);
  }
}
