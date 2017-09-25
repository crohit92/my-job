import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDaybookComponent } from './user-daybook.component';

describe('UserDaybookComponent', () => {
  let component: UserDaybookComponent;
  let fixture: ComponentFixture<UserDaybookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDaybookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDaybookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
