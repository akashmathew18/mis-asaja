import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Receivables } from './receivables';

describe('Receivables', () => {
  let component: Receivables;
  let fixture: ComponentFixture<Receivables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Receivables],
    }).compileComponents();

    fixture = TestBed.createComponent(Receivables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
