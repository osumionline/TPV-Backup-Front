import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import CreateSubscriptionRequestInterface from '@model/create-subscription-request.interface';
import CreateSubscriptionResponseInterface from '@model/create-subscription-response.interface';
import GetSubscriptionsResponseInterface from '@model/get-subscriptions-response.interface';
import { Observable } from 'rxjs';

@Service()
export default class SubscriptionService {
  private readonly http: HttpClient = inject(HttpClient);

  getAll(): Observable<GetSubscriptionsResponseInterface> {
    return this.http.get<GetSubscriptionsResponseInterface>(
      `${API_BASE_URL}/admin/subscriptions`,
    );
  }

  create(
    data: CreateSubscriptionRequestInterface,
  ): Observable<CreateSubscriptionResponseInterface> {
    return this.http.post<CreateSubscriptionResponseInterface>(
      `${API_BASE_URL}/admin/subscriptions/create`,
      data,
    );
  }
}
