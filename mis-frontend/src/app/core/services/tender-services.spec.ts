import { TestBed } from '@angular/core/testing';

import { TenderServices } from './tender-services';

describe('TenderServices', () => {
  let service: TenderServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenderServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
