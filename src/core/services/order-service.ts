import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Order, OrderRequestDTO} from '../models/ordens';
import {Observable} from 'rxjs';
import {env} from '../../environment/environment';
import {Page} from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private httpClient: HttpClient) {
  }

  createOrder(order: OrderRequestDTO): Observable<Order> {
    return this.httpClient.post<Order>(env.apiUrl + "/ordens", order);
  }

  getOrders(clienteFiltro?: string, statusFiltro?: string, dataInicio?: string, dataFim?: string, filtrarDataCriacao: boolean = true, page: number = 0, size: number = 10): Observable<Page<Order>> {
    let params = new HttpParams();
    if (clienteFiltro) {
      params = params.set('cliente', clienteFiltro);
    }
    if (statusFiltro) {
      params = params.set('status', statusFiltro);
    }
    if (dataInicio && dataFim) {
      params = params.set('dataInicio', dataInicio);
      params = params.set('dataFim', dataFim);
      params = params.set('filtrarDataCriacao', filtrarDataCriacao);
    }
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());
    return this.httpClient.get<Page<Order>>(env.apiUrl + "/ordens", {params});
  }

  getOneOrder(uuid: string): Observable<Order> {
    return this.httpClient.get<Order>(env.apiUrl + "/ordens/" + uuid);
  }

  updateOrder(uuid: string, order: Order): Observable<Order> {
    return this.httpClient.put<Order>(env.apiUrl + "/ordens/" + uuid, order);
  }

  deleteOrder(uuid: string): Observable<void> {
    return this.httpClient.delete<void>(env.apiUrl + "/ordens/" + uuid);
  }
}
