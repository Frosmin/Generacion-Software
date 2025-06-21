import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseComponent } from '../../components/exercise/exercise.component';
import {
  CodeforcesService,
  TransformedProblem,
} from '../../services/codeforce.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-exercises-list',
  imports: [ExerciseComponent, CommonModule, TranslatePipe],
  templateUrl: './exercises-list.component.html',
  styleUrl: './exercises-list.component.scss',
})
export class ExercisesListComponent implements OnInit {
  allExercises: TransformedProblem[] = [];
  filteredExercises: TransformedProblem[] = [];
  selectedDifficulty: 'easy' | 'medium' | 'hard' = 'easy';
  isLoading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 10;
  currentEndIndex = 10;
  visibleExercises: TransformedProblem[] = [];

  mock: TransformedProblem[] = [
    {
      id: '0',
      title: 'Trippi Troppi',
      statement:
        'Trippi Troppi reside en un mundo extraño. El nombre antiguo de cada país consta de tres cadenas. La primera letra de cada cadena se concatena para formar el nombre moderno del país.',
      rating: 800,
      tags: ['implementation'],
      contestId: 1000,
      index: 'A',
      difficulty: 'Easy',
    },
    {
      id: '1',
      title: 'Bobritto Bandito',
      statement:
        'En la ciudad de residencia de Bobritto Bandito, hay un número infinito de casas en una recta numérica infinita, con casas en ...,-2,-1,0,1,2,.... El día 0 inició una plaga infectando a los desafortunados habitantes de la casa 0',
      rating: 1200,
      tags: ['math', 'implementation'],
      contestId: 1001,
      index: 'B',
      difficulty: 'Medium',
    },
  ];

  constructor(private codeforcesService: CodeforcesService) {}

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.isLoading = true;
    this.error = null;

    this.codeforcesService.getAllProblems().subscribe({
      next: (exercises) => {
        this.allExercises = exercises;
        this.filterExercises();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar ejercicios:', error);
        this.error = 'Error al cargar los ejercicios. Usando datos de prueba.';
        this.allExercises = this.mock;
        this.filterExercises();
        this.isLoading = false;
      },
    });
  }

  onDifficultyChange(difficulty: 'easy' | 'medium' | 'hard') {
    this.selectedDifficulty = difficulty;
    this.filterExercises();
    this.currentEndIndex = this.pageSize;
    this.visibleExercises = this.filteredExercises.slice(
      0,
      this.currentEndIndex
    );
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 5;

    if (atBottom) {
      this.loadMoreExercises();
    }
  }

  loadMoreExercises() {
    if (this.currentEndIndex >= this.filteredExercises.length) return;

    this.currentEndIndex += this.pageSize;
    const next = this.filteredExercises.slice(0, this.currentEndIndex);
    this.visibleExercises = next;
  }

  private filterExercises() {
    const filtered = this.codeforcesService.filterProblemsByDifficulty(
      this.allExercises,
      this.selectedDifficulty
    );

    this.filteredExercises = filtered;
    this.currentEndIndex = this.pageSize;
    this.visibleExercises = this.filteredExercises.slice(
      0,
      this.currentEndIndex
    );
  }
}
