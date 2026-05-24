import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLedger } from './team-ledger';

describe('TeamLedger', () => {
  let component: TeamLedger;
  let fixture: ComponentFixture<TeamLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLedger],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamLedger);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
