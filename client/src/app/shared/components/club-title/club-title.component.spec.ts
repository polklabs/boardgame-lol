import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubTitleComponent } from './club-title.component';

describe('ClubTitleComponent', () => {
  let component: ClubTitleComponent;
  let fixture: ComponentFixture<ClubTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClubTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
