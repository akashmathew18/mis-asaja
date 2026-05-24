import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExecutives } from './manage-executives';

describe('ManageExecutives', () => {
  let component: ManageExecutives;
  let fixture: ComponentFixture<ManageExecutives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageExecutives],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageExecutives);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
