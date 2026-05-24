import { TestBed } from '@angular/core/testing';

import { AdminRoute } from './admin.route';

describe('AdminRoute', () => {
  let service: AdminRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminRoute);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
