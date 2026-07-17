import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrophyIconComponent } from './trophy-icon.component';

describe('TrophyIconComponent', () => {
  let component: TrophyIconComponent;
  let fixture: ComponentFixture<TrophyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrophyIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrophyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
