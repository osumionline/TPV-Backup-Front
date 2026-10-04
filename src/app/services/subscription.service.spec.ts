import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import API_BASE_URL from '@constants/api.config';
import CreateSubscriptionResponseInterface from '@model/subscriptions/create-subscription-response.interface';
import DeleteSubscriptionResponseInterface from '@model/subscriptions/delete-subscription-response.interface';
import GetSubscriptionsResponseInterface from '@model/subscriptions/get-subscriptions-response.interface';
import SetSubscriptionActiveResponseInterface from '@model/subscriptions/set-subscription-active-response.interface';
import UpdateSubscriptionResponseInterface from '@model/subscriptions/update-subscription-response.interface';
import SubscriptionService from '@services/subscription.service';
import { firstValueFrom } from 'rxjs';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubscriptionService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SubscriptionService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should get all subscriptions', async (): Promise<void> => {
    const resultPromise: Promise<GetSubscriptionsResponseInterface> = firstValueFrom(
      service.getAll(),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/subscriptions`);

    expect(request.request.method).toBe('GET');

    const response = {
      status: 'ok',
      list: [],
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should create a subscription', async (): Promise<void> => {
    const data = {
      name: 'Cliente',
      contactEmail: 'cliente@example.com',
      expiresAt: '2027-12-31',
      maxInstallations: 2,
      maxBackupsPerInstallation: 6,
    };

    const resultPromise: Promise<CreateSubscriptionResponseInterface> = firstValueFrom(
      service.create(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/subscriptions/create`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'subscription-public-id',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should update a subscription', async (): Promise<void> => {
    const data = {
      publicId: 'subscription-public-id',
      name: 'Cliente actualizado',
      contactEmail: null,
      expiresAt: null,
      maxInstallations: 3,
      maxBackupsPerInstallation: 10,
    };

    const resultPromise: Promise<UpdateSubscriptionResponseInterface> = firstValueFrom(
      service.update(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/subscriptions/update`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'subscription-public-id',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should change a subscription active state', async (): Promise<void> => {
    const data = {
      publicId: 'subscription-public-id',
      active: false,
    };

    const resultPromise: Promise<SetSubscriptionActiveResponseInterface> = firstValueFrom(
      service.setActive(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/subscriptions/set-active`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'subscription-public-id',
      active: false,
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should delete a subscription', async (): Promise<void> => {
    const data = {
      publicId: 'subscription-public-id',
    };

    const resultPromise: Promise<DeleteSubscriptionResponseInterface> = firstValueFrom(
      service.delete(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/subscriptions/delete`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'subscription-public-id',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });
});
