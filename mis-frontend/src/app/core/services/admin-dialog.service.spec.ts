import { TestBed } from '@angular/core/testing';

import { AdminDialogService } from './admin-dialog.service';

describe('AdminDialogService', () => {
  let service: AdminDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
