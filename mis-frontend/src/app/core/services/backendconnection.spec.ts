import { TestBed } from '@angular/core/testing';

import { Backendconnection } from './backendconnection';

describe('Backendconnection', () => {
  let service: Backendconnection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Backendconnection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
