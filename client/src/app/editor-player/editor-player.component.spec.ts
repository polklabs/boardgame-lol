import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorPlayerComponent } from './editor-player.component';

describe('EditorPlayerComponent', () => {
  let component: EditorPlayerComponent;
  let fixture: ComponentFixture<EditorPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
