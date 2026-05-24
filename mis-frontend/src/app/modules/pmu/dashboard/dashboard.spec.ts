import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmuDashboard } from './dashboard';

describe('Dashboard', () => {
  let component: PmuDashboard;
  let fixture: ComponentFixture<PmuDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmuDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PmuDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
