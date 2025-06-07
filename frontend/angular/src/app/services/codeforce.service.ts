import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CodeforcesProblem {
  contestId?: number;
  index: string;
  name: string;
  type: string;
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CodeforcesApiResponse {
  status: string;
  result: {
    problems: CodeforcesProblem[];
    problemStatistics: any[];
  };
}

export interface Exercise {
  id: string;
  title: string;
  statement: string;
  rating?: number;
  tags: string[];
  contestId?: number;
  index: string;
}

@Injectable({
  providedIn: 'root',
})
export class CodeforcesService {
  private readonly API_BASE_URL = 'https://codeforces.com/api';

  constructor(private http: HttpClient) {}

  getAllProblems(): Observable<Exercise[]> {
    return this.http
      .get<CodeforcesApiResponse>(`${this.API_BASE_URL}/problemset.problems`)
      .pipe(
        map((response) => {
          if (response.status === 'OK') {
            return response.result.problems.map((problem) =>
              this.mapToExercise(problem)
            );
          }
          throw new Error('Error al obtener problemas de Codeforces');
        })
      );
  }

  private mapToExercise(problem: CodeforcesProblem): Exercise {
    return {
      id: `${problem.contestId || 'gym'}-${problem.index}`,
      title: problem.name,
      statement: `Problema ${problem.index} del contest ${
        problem.contestId || 'Gym'
      }. Dificultad: ${
        problem.rating || 'No especificada'
      }. Tags: ${problem.tags.join(', ')}`,
      rating: problem.rating,
      tags: problem.tags,
      contestId: problem.contestId,
      index: problem.index,
    };
  }

  filterProblemsByDifficulty(
    problems: Exercise[],
    difficulty: 'easy' | 'medium' | 'hard'
  ): Exercise[] {
    return problems.filter((problem) => {
      if (!problem.rating) return difficulty === 'hard';

      switch (difficulty) {
        case 'easy':
          return problem.rating < 0;
        case 'medium':
          return problem.rating <= 1200;
        case 'hard':
          return problem.rating > 1800;
        default:
          return true;
      }
    });
  }
}
