import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnersMapComponent } from './runners-map.component';

describe('RunnersMapComponent', () => {
  let component: RunnersMapComponent;
  let fixture: ComponentFixture<RunnersMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunnersMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunnersMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
