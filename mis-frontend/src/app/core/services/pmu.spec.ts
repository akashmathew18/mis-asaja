import { TestBed } from '@angular/core/testing';

import { Pmu } from './pmu';

describe('Pmu', () => {
  let service: Pmu;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pmu);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
