import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingTenders } from './upcoming-tenders';

describe('UpcomingTenders', () => {
  let component: UpcomingTenders;
  let fixture: ComponentFixture<UpcomingTenders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingTenders],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingTenders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
