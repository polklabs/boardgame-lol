import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardGameTableComponent } from './board-game-table.component';

describe('BoardGameTableComponent', () => {
  let component: BoardGameTableComponent;
  let fixture: ComponentFixture<BoardGameTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardGameTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardGameTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
