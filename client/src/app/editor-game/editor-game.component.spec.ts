import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorGameComponent } from './editor-game.component';

describe('EditorGameComponent', () => {
  let component: EditorGameComponent;
  let fixture: ComponentFixture<EditorGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorGameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
