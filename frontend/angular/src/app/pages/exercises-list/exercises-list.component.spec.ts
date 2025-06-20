import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExercisesListComponent } from './exercises-list.component';

describe('ExercisesListComponent', () => {
  let component: ExercisesListComponent;
  let fixture: ComponentFixture<ExercisesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercisesListComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercisesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
