import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProblemComponent } from './tabs/problem/problem.component';
import { SubmitComponent } from './tabs/submit/submit.component';
import { SubmissionsComponent } from './tabs/submissions/submissions.component';
import { ActivatedRoute } from '@angular/router';
import { CodeforcesService, Exercise } from '../../services/codeforce.service';

interface ExerciseSubmission {
  id: number;
  submittedAt: Date;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  executionTime: string;
  memory: string;
}

@Component({
  selector: 'app-see-exercise',
  templateUrl: './see-exercise.component.html',
  styleUrls: ['./see-exercise.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProblemComponent,
    SubmitComponent,
    SubmissionsComponent,
  ],
})
export class SeeExerciseComponent implements OnInit {
  activeTab: 'problem' | 'submit' | 'submissions' = 'problem';
  exercise: Exercise | null = null;
  loading = true;
  error: string | null = null;
  submissions: ExerciseSubmission[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private codeforcesService: CodeforcesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.error = null;

      this.codeforcesService.getProblemById(id).subscribe({
        next: (exercise) => {
          this.loading = false;
          if (exercise) {
            this.exercise = exercise;
            console.log('Ejercicio cargado:', exercise); // Para debug
          } else {
            this.error = 'Ejercicio no encontrado';
            console.error('Ejercicio no encontrado con ID:', id);
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error al cargar el ejercicio';
          console.error('Error al cargar ejercicio:', error);
        },
      });
    } else {
      this.loading = false;
      this.error = 'ID de ejercicio no válido';
    }
  }

  goBack(): void {
    this.location.back();
  }

  setActiveTab(tab: 'problem' | 'submit' | 'submissions'): void {
    this.activeTab = tab;
  }

  onSolutionSubmitted(code: string): void {
    console.log('Solución enviada:', code);
  }

  handleKeydown(
    event: KeyboardEvent,
    tab: 'problem' | 'submit' | 'submissions'
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.setActiveTab(tab);
      event.preventDefault();
    }
  }
}
