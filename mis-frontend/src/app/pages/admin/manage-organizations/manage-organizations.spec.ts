import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrganizations } from './manage-organizations';

describe('ManageOrganizations', () => {
  let component: ManageOrganizations;
  let fixture: ComponentFixture<ManageOrganizations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageOrganizations],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageOrganizations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
