import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderStatus } from './tender-status';

describe('TenderStatus', () => {
  let component: TenderStatus;
  let fixture: ComponentFixture<TenderStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(TenderStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
