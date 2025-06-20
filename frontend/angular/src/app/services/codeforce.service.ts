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
    problemStatistics: Record<string, unknown>[];
  };
}

export interface TransformedProblem {
  id: string;
  title: string;
  statement: string;
  rating?: number;
  tags: string[];
  contestId?: number;
  index: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Exercise {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  memoryLimit: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  topics: string[];
  materials: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class CodeforcesService {
  private readonly API_BASE_URL = 'https://codeforces.com/api';

  constructor(private http: HttpClient) {}

  getAllProblems(): Observable<TransformedProblem[]> {
    return this.http
      .get<CodeforcesApiResponse>(`${this.API_BASE_URL}/problemset.problems`)
      .pipe(
        map((response) => {
          if (response.status === 'OK') {
            return response.result.problems.map((problem) =>
              this.mapToTransformedProblem(problem)
            );
          }
          throw new Error('Error al obtener problemas de Codeforces');
        })
      );
  }

  private mapToTransformedProblem(
    problem: CodeforcesProblem
  ): TransformedProblem {
    return {
      id: `${problem.contestId || 'gym'}-${problem.index}`,
      title: problem.name,
      statement: `Problema ${problem.index} del contest ${
        problem.contestId || 'Gym'
      }. Tags: ${problem.tags.join(', ')}`,
      rating: problem.rating,
      tags: problem.tags,
      contestId: problem.contestId,
      index: problem.index,
      difficulty: this.mapRatingToDifficulty(problem.rating || 0),
    };
  }

  private mapRatingToDifficulty(rating: number): 'Medium' | 'Hard' {
    if (rating <= 1300) return 'Medium';
    return 'Hard';
  }

  filterProblemsByDifficulty(
    problems: TransformedProblem[],
    difficulty: 'easy' | 'medium' | 'hard'
  ): TransformedProblem[] {
    return problems.filter((problem) => {
      return problem.difficulty?.toLowerCase() === difficulty;
    });
  }

  getProblemById(id: string): Observable<Exercise | undefined> {
    return this.getAllProblems().pipe(
      map((problems) => {
        const problem = problems.find((p) => p.id === id);
        return problem ? this.transformToExercise(problem) : undefined;
      })
    );
  }

  private transformToExercise(problem: TransformedProblem): Exercise {
    return {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      timeLimit: this.getTimeLimit(problem.difficulty),
      memoryLimit: this.getMemoryLimit(problem.difficulty),
      description: this.generateDescription(problem),
      inputDescription: this.generateInputDescription(problem),
      outputDescription: this.generateOutputDescription(problem),
      topics: this.mapTagsToTopics(problem.tags),
      materials: this.generateMaterials(problem.tags),
      examples: this.generateExamples(problem),
    };
  }

  private getTimeLimit(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
    switch (difficulty) {
      case 'Easy':
        return '1 segundo';
      case 'Medium':
        return '2 segundos';
      case 'Hard':
        return '3 segundos';
      default:
        return '2 segundos';
    }
  }

  private getMemoryLimit(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
    switch (difficulty) {
      case 'Easy':
        return '256 MB';
      case 'Medium':
        return '512 MB';
      case 'Hard':
        return '1024 MB';
      default:
        return '512 MB';
    }
  }

  private generateDescription(problem: TransformedProblem): string {
    const baseDescription = `Este es el problema "${
      problem.title
    }" del contest ${problem.contestId || 'Gym'}.`;
    const difficultyText = problem.rating
      ? ` Tiene una dificultad de ${problem.rating} puntos.`
      : '';
    const tagsText =
      problem.tags.length > 0
        ? ` Los temas principales incluyen: ${problem.tags.join(', ')}.`
        : '';

    return (
      baseDescription +
      difficultyText +
      tagsText +
      '\n\nEste problema te ayudará a practicar conceptos fundamentales de programación competitiva.'
    );
  }

  private generateInputDescription(problem: TransformedProblem): string {
    if (problem.tags.includes('interactive')) {
      return 'Este es un problema interactivo. Tu programa debe comunicarse con el juez mediante entrada y salida estándar.';
    }

    return 'La primera línea de entrada contiene los parámetros del problema. Lee cuidadosamente el enunciado para entender el formato exacto de entrada.';
  }

  private generateOutputDescription(problem: TransformedProblem): string {
    if (problem.tags.includes('interactive')) {
      return 'Sigue el protocolo de comunicación especificado en el problema. No olvides hacer flush después de cada output.';
    }

    return 'Imprime la respuesta según se especifica en el enunciado. Asegúrate de seguir exactamente el formato de salida requerido.';
  }

  private mapTagsToTopics(tags: string[]): string[] {
    const topicMapping: Record<string, string> = {
      math: 'Matemáticas',
      implementation: 'Implementación',
      greedy: 'Algoritmos Greedy',
      dp: 'Programación Dinámica',
      'data structures': 'Estructuras de Datos',
      graphs: 'Teoría de Grafos',
      strings: 'Manipulación de Cadenas',
      'number theory': 'Teoría de Números',
      geometry: 'Geometría',
      combinatorics: 'Combinatoria',
      'binary search': 'Búsqueda Binaria',
      'two pointers': 'Técnica de Dos Punteros',
      sorting: 'Algoritmos de Ordenamiento',
      'brute force': 'Fuerza Bruta',
      'constructive algorithms': 'Algoritmos Constructivos',
    };

    return tags.map((tag) => topicMapping[tag] || this.capitalizeFirst(tag));
  }

  private generateMaterials(tags: string[]): string[] {
    const materialMapping: Record<string, string[]> = {
      math: ['Aritmética Básica', 'Álgebra Elemental'],
      implementation: ['Programación Básica', 'Manejo de Arrays'],
      greedy: ['Algoritmos Greedy', 'Optimización Local'],
      dp: ['Programación Dinámica', 'Memoización'],
      'data structures': ['Arrays', 'Listas Enlazadas', 'Pilas y Colas'],
      graphs: ['Representación de Grafos', 'DFS y BFS'],
      strings: ['Manipulación de Strings', 'Pattern Matching'],
      'number theory': ['Números Primos', 'GCD y LCM'],
      geometry: ['Geometría Básica', 'Coordenadas'],
      'binary search': ['Búsqueda Binaria', 'Invariantes'],
      sorting: ['Algoritmos de Ordenamiento', 'Comparadores'],
    };

    const materials = new Set<string>();
    tags.forEach((tag) => {
      const tagMaterials = materialMapping[tag];
      if (tagMaterials) {
        tagMaterials.forEach((material) => materials.add(material));
      }
    });

    return Array.from(materials);
  }

  private generateExamples(
    problem: TransformedProblem
  ): { input: string; output: string; explanation?: string }[] {
    if (problem.tags.includes('math')) {
      return [
        {
          input: '3 5',
          output: '8',
          explanation: 'Suma simple: 3 + 5 = 8',
        },
        {
          input: '10 7',
          output: '17',
          explanation: 'Suma simple: 10 + 7 = 17',
        },
      ];
    }

    if (problem.tags.includes('implementation')) {
      return [
        {
          input: '5\n1 2 3 4 5',
          output: '15',
          explanation: 'Suma de elementos del array: 1+2+3+4+5 = 15',
        },
        {
          input: '3\n10 20 30',
          output: '60',
          explanation: 'Suma de elementos del array: 10+20+30 = 60',
        },
      ];
    }

    return [
      {
        input: '2',
        output: '2',
        explanation: 'Ejemplo básico del problema',
      },
    ];
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
