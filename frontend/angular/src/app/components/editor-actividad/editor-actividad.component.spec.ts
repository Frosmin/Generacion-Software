import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorActividadComponent } from './editor-actividad.component';

describe('EditorActividadComponent', () => {
  let component: EditorActividadComponent;
  let fixture: ComponentFixture<EditorActividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorActividadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorActividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
