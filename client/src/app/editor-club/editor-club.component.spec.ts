import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorClubComponent } from './editor-club.component';

describe('EditorClubComponent', () => {
  let component: EditorClubComponent;
  let fixture: ComponentFixture<EditorClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorClubComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
