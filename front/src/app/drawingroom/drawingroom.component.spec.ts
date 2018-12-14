import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingroomComponent } from './drawingroom.component';

describe('DrawingroomComponent', () => {
  let component: DrawingroomComponent;
  let fixture: ComponentFixture<DrawingroomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingroomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
