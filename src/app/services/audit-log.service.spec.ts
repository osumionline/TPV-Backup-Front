import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import API_BASE_URL from '@constants/api.config';
import GetAuditLogsResponseInterface from '@model/audit/get-audit-logs-response.interface';
import AuditLogService from '@services/audit-log.service';
import { firstValueFrom } from 'rxjs';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditLogService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuditLogService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  /**
   * Verifies paginated audit retrieval.
   *
   * @returns Promise resolved when the request has been checked.
   */
  it('should get one audit page', async (): Promise<void> => {
    const response: GetAuditLogsResponseInterface = {
      status: 'ok',
      message: '',
      page: 2,
      pageSize: 25,
      total: 30,
      totalPages: 2,
      list: [],
    };

    const resultPromise: Promise<GetAuditLogsResponseInterface> = firstValueFrom(
      service.getPage(2, 25),
    );

    const request = httpController.expectOne(
      (candidate) =>
        candidate.url === `${API_BASE_URL}/admin/audit` &&
        candidate.params.get('page') === '2' &&
        candidate.params.get('pageSize') === '25',
    );

    expect(request.request.method).toBe('GET');

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });
});
