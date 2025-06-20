import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { SeeExerciseComponent } from './see-exercise.component';

describe('SeeExerciseComponent', () => {
  let component: SeeExerciseComponent;
  let fixture: ComponentFixture<SeeExerciseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SeeExerciseComponent,
        HttpClientTestingModule, // ✅ Necesario para servicios que usan HttpClient
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }),
            snapshot: {
              paramMap: {
                get: () => '123',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeeExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the SeeExerciseComponent', () => {
    expect(component).toBeTruthy();
  });
});
