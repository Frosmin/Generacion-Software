import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SearchComponent } from '../../components/search/search.component';
import { EditorComponent } from '../../shared/editor/editor.component'; 
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../services/courses.service';

interface CourseData {
  course: {
    id: number;
    title: string;
    description: string;
    goto: string;
  };
  contents: ContenidoCurso[];
}

interface ContenidoCurso {
  id: number;
  title: string;
  paragraph: string[];
  subcontent: SubContent[];
  next?: string;
  instrucciones?: string;
  codigo_incompleto?: string;
  solucion_correcta?: string;
}

interface SubContent {
  subtitle: string;
  subparagraph: string[];
  example: string[];
}

interface CursoDisponible {
  id: number;
  nombre: string;
  goto: string;
  description: string;
}

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, EditorComponent, SearchComponent, CommonModule],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})
export class IntroductionComponent implements OnInit {
  curso: CourseData | null = null;
  resetCnt = 0;
  salidaCodigo = '';
  resultadoVerificacion = '';
  currentMock: ContenidoCurso[] = [];
  initialSubject = 0;
  totalSubjects = 0;
  content: ContenidoCurso | null = null;
  allCursos: string[] = [];
  loading = false;
  error: string | null = null;
  cursosDisponibles: CursoDisponible[] = [];
  currentGoto = '';

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {
    this.cursosDisponibles = this.coursesService.getAvailableCourses();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const gotoParam = params['id'];
      if (gotoParam) {
        this.currentGoto = gotoParam;
        this.loadCourseByGoto(gotoParam);
      }
    });
  }

  loadCourseByGoto(gotoParam: string): void {
    this.loading = true;
    this.error = null;
    this.coursesService.getCourseIdByGoto(gotoParam).subscribe({
      next: (response) => {
        const courseId = response.id;
        this.loadCourseById(courseId);
      },
      error: (error) => {
        this.handleCourseDataError(error, gotoParam);
      }
    });
  }

  private loadCourseById(courseId: number): void {
    this.coursesService.getCourseById(courseId).subscribe({
      next: (data) => {
        this.handleCourseDataSuccess(data);
      },
      error: (error) => {
        this.handleCourseDataError(error, this.currentGoto);
      }
    });
  }

  private handleCourseDataSuccess(data: CourseData): void {
    if (!this.coursesService.validateCourseStructure(data)) {
      this.error = 'La estructura del curso no es válida';
      this.loading = false;
      return;
    }
    this.curso = data;
    this.currentMock = data.contents;
    this.initialSubject = 0;
    this.totalSubjects = this.currentMock.length - 1;
    this.content = this.currentMock[this.initialSubject];
    this.allCursos = this.currentMock.map(e => e.title);
    this.resetCnt++;
    this.loading = false;
    this.error = null;
  }

  private handleCourseDataError(error: unknown, requestedGoto: string): void {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error loading course data:', error);
    this.error = errorMessage || 'Error al cargar el curso';
    this.loading = false;
    if (requestedGoto !== 'intro') {
      console.log('Intentando cargar curso por defecto (Introducción)...');
      setTimeout(() => {
        this.loadCourseByGoto('intro');
      }, 2000);
    }
  }

  gonext(): void {
    if (this.initialSubject < this.totalSubjects) {
      this.initialSubject++;
      this.update();
    }
  }

  goback(): void {
    if (this.initialSubject > 0) {
      this.initialSubject--;
      this.update();
    }
  }

  update(): void {
    this.content = this.currentMock[this.initialSubject];
    this.resetCnt++;
  }

  handleSelection(index: number): void {
    this.initialSubject = index;
    this.update();
  }

  onCodeOutput(output: string): void {
    this.salidaCodigo = output;
  }

  onSolutionCheck(result: {correct: boolean, output: string}): void {
    if (result.correct) {
      this.resultadoVerificacion = '¡Correcto! ✅';
    } else {
      this.resultadoVerificacion = 'Incorrecto. Inténtalo de nuevo. ❌';
    }
    this.salidaCodigo = result.output;
  }

  cambiarCurso(cursoDisponible: CursoDisponible): void {
    this.loading = true;
    this.error = null;
    this.currentGoto = cursoDisponible.goto;
    this.coursesService.getCourseById(cursoDisponible.id).subscribe({
      next: (data) => {
        this.handleCourseDataSuccess(data);
      },
      error: (error) => {
        this.handleCourseDataError(error, cursoDisponible.goto);
      }
    });
  }

  cambiarCursoMock(mock: ContenidoCurso[]): void {
    this.currentMock = mock;
    this.initialSubject = 0;
    this.totalSubjects = this.currentMock.length - 1;
    this.content = this.currentMock[this.initialSubject];
    this.allCursos = this.currentMock.map(e => e.title);
    this.resetCnt++;
  }

  getNextTopic(): string | null {
    return this.content?.next || null;
  }

  hasNextTopic(): boolean {
    return this.initialSubject < this.totalSubjects;
  }

  hasPreviousTopic(): boolean {
    return this.initialSubject > 0;
  }

  loadNextContent(): void {
    if (!this.curso || !this.content) return;
    this.coursesService.getNextContent(this.curso.course.id, this.content.id).subscribe({
      next: (nextContent) => {
        if (nextContent) {
          const nextIndex = this.currentMock.findIndex(c => c.id === nextContent.id);
          if (nextIndex !== -1) {
            this.initialSubject = nextIndex;
            this.update();
          }
        }
      },
      error: (error) => {
        console.error('Error loading next content:', error);
      }
    });
  }

  loadPreviousContent(): void {
    if (!this.curso || !this.content) return;
    this.coursesService.getPreviousContent(this.curso.course.id, this.content.id).subscribe({
      next: (prevContent) => {
        if (prevContent) {
          const prevIndex = this.currentMock.findIndex(c => c.id === prevContent.id);
          if (prevIndex !== -1) {
            this.initialSubject = prevIndex;
            this.update();
          }
        }
      },
      error: (error) => {
        console.error('Error loading previous content:', error);
      }
    });
  }

  retry(): void {
    const currentGoto = this.currentGoto || 'intro';
    this.loadCourseByGoto(currentGoto);
  }

  getCurrentCourseInfo(): CursoDisponible | null {
    return this.coursesService.getCourseInfoByGoto(this.currentGoto);
  }
  getExampleCode(example: any): string {
  // Si example es un string, devolverlo directamente
  if (typeof example === 'string') {
    return example;
  }
  
  // Si example es un objeto con propiedad 'code'
  if (example && typeof example === 'object' && example.code) {
    return example.code;
  }
  
  // Si example es un objeto, convertirlo a JSON formateado
  if (example && typeof example === 'object') {
    return JSON.stringify(example, null, 2);
  }
  
  // Fallback
  return 'Código no disponible';
}
}
