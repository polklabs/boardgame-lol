import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorBoardGameComponent } from './editor-board-game.component';

describe('EditorBoardGameComponent', () => {
  let component: EditorBoardGameComponent;
  let fixture: ComponentFixture<EditorBoardGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorBoardGameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorBoardGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
