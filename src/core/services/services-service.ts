import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Service, ServiceRequestDTO} from '../models/service';
import {Observable} from 'rxjs';
import {env} from '../../environment/environment';
import {Page} from '../models/page';
import {Cliente} from '../models/cliente';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  constructor(private httpClient: HttpClient) {}

  createService(service: ServiceRequestDTO): Observable<Service> {
    return this.httpClient.post<Service>(env.apiUrl + "/servicos", service);
  }

  getServices(nomeFiltro?: string, page: number = 0, size: number = 10): Observable<Page<Service>> {
    let params = new HttpParams();
    if (nomeFiltro) {
      params = params.set('nome', nomeFiltro);
    }
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());
    return this.httpClient.get<Page<Service>>(env.apiUrl + "/servicos", {params});
  }

  updateService(uuid: string, service: ServiceRequestDTO): Observable<Service> {
    return this.httpClient.put<Service>(env.apiUrl + "/servicos/" + uuid, service);
  }

  deleteService(uuid: string): Observable<void> {
    return this.httpClient.delete<void>(env.apiUrl + "/servicos/" + uuid);
  }
}
