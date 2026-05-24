import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderList } from './tender-list';

describe('TenderList', () => {
  let component: TenderList;
  let fixture: ComponentFixture<TenderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderList],
    }).compileComponents();

    fixture = TestBed.createComponent(TenderList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
