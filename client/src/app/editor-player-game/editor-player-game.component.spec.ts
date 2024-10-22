import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorPlayerGameComponent } from './editor-player-game.component';

describe('EditorPlayerGameComponent', () => {
  let component: EditorPlayerGameComponent;
  let fixture: ComponentFixture<EditorPlayerGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorPlayerGameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorPlayerGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
