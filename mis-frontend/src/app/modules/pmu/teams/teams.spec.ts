import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmuTeams } from './Teams';

describe('PmuTeams', () => {
  let component: PmuTeams;
  let fixture: ComponentFixture<PmuTeams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmuTeams],
    }).compileComponents();

    fixture = TestBed.createComponent(PmuTeams);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
