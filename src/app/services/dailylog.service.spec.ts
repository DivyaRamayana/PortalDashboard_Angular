import { TestBed } from '@angular/core/testing';

import { DailylogService } from './dailylog.service';

describe('DailylogService', () => {
  let service: DailylogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailylogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
