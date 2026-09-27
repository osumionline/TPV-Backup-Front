import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import CreateSubscriptionRequestInterface from '@model/create-subscription-request.interface';
import CreateSubscriptionResponseInterface from '@model/create-subscription-response.interface';
import GetSubscriptionsResponseInterface from '@model/get-subscriptions-response.interface';
import UpdateSubscriptionRequestInterface from '@model/update-subscription-request.interface';
import UpdateSubscriptionResponseInterface from '@model/update-subscription-response.interface';
import { Observable } from 'rxjs';

@Service()
export default class SubscriptionService {
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Gets all subscriptions available to the administration panel.
   *
   * @returns Observable with the subscriptions response.
   */
  getAll(): Observable<GetSubscriptionsResponseInterface> {
    return this.http.get<GetSubscriptionsResponseInterface>(`${API_BASE_URL}/admin/subscriptions`);
  }

  /**
   * Creates a new subscription.
   *
   * @param data Subscription data to create.
   *
   * @returns Observable with the creation response.
   */
  create(
    data: CreateSubscriptionRequestInterface,
  ): Observable<CreateSubscriptionResponseInterface> {
    return this.http.post<CreateSubscriptionResponseInterface>(
      `${API_BASE_URL}/admin/subscriptions/create`,
      data,
    );
  }

  /**
   * Updates an existing subscription.
   *
   * @param data Complete subscription data to update.
   *
   * @returns Observable with the update response.
   */
  update(
    data: UpdateSubscriptionRequestInterface,
  ): Observable<UpdateSubscriptionResponseInterface> {
    return this.http.post<UpdateSubscriptionResponseInterface>(
      `${API_BASE_URL}/admin/subscriptions/update`,
      data,
    );
  }
}
