import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeExerciseComponent } from './see-exercise.component';

describe('SeeExerciseComponent', () => {
  let component: SeeExerciseComponent;
  let fixture: ComponentFixture<SeeExerciseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeExerciseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
