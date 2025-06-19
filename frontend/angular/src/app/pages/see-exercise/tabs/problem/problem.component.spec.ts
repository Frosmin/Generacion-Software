// problem.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProblemComponent } from './problem.component';

describe('ProblemComponent', () => {
  let component: ProblemComponent;
  let fixture: ComponentFixture<ProblemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProblemComponent);
    component = fixture.componentInstance;

    component.exercise = {
      id: '1',
      title: 'Test Exercise',
      difficulty: 'Easy',
      timeLimit: '1s',
      memoryLimit: '64MB',
      description: 'Descripción de prueba para test',
      inputDescription: 'Entrada de prueba',
      outputDescription: 'Salida de prueba',
      topics: ['arrays', 'strings'],
      materials: [],
      examples: [
        {
          input: '1 2 3',
          output: '6',
          explanation: 'Suma de números',
        },
      ],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render problem description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain(
      'Descripción de prueba para test'
    );
  });
});
