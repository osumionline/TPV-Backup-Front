import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import CreateSubscriptionRequestInterface from '@model/create-subscription-request.interface';
import CreateSubscriptionResponseInterface from '@model/create-subscription-response.interface';
import DeleteSubscriptionRequestInterface from '@model/delete-subscription-request.interface';
import DeleteSubscriptionResponseInterface from '@model/delete-subscription-response.interface';
import GetSubscriptionsResponseInterface from '@model/get-subscriptions-response.interface';
import SetSubscriptionActiveRequestInterface from '@model/set-subscription-active-request.interface';
import SetSubscriptionActiveResponseInterface from '@model/set-subscription-active-response.interface';
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

  /**
   * Changes the administrative active state of a subscription.
   *
   * @param data Subscription identifier and desired active state.
   *
   * @returns Observable with the state change response.
   */
  setActive(
    data: SetSubscriptionActiveRequestInterface,
  ): Observable<SetSubscriptionActiveResponseInterface> {
    return this.http.post<SetSubscriptionActiveResponseInterface>(
      `${API_BASE_URL}/admin/subscriptions/set-active`,
      data,
    );
  }

  /**
   * Deletes a subscription without registered installations.
   *
   * @param data Subscription identifier to delete.
   *
   * @returns Observable with the deletion response.
   */
  delete(
    data: DeleteSubscriptionRequestInterface,
  ): Observable<DeleteSubscriptionResponseInterface> {
    return this.http.post<DeleteSubscriptionResponseInterface>(
      `${API_BASE_URL}/admin/subscriptions/delete`,
      data,
    );
  }
}
