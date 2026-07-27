import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayDetailComponent } from './play-detail.component';

describe('PlayDetailComponent', () => {
  let component: PlayDetailComponent;
  let fixture: ComponentFixture<PlayDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
