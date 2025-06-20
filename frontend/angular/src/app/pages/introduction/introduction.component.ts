import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EditorActividadComponent } from '../../components/editor-actividad/editor-actividad.component';
import { SearchComponent } from '../../components/search/search.component';
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
  imports: [MatButtonModule, EditorActividadComponent, SearchComponent, CommonModule],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})
export class IntroductionComponent implements OnInit {
  curso: CourseData | null = null;
  resetCnt = 0;
  salidaCodigo = '';
  currentMock: ContenidoCurso[] = [];
  initialSubject = 0;
  totalSubjects = 0;
  content: ContenidoCurso | null = null;
  allCursos: string[] = [];
  loading = false;
  error: string | null = null;
  cursosDisponibles: CursoDisponible[] = [];
  currentGoto: string = '';

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {
    this.cursosDisponibles = this.coursesService.getAvailableCourses();
    
    // Suscribirse a los cambios de parámetros de la URL
    this.route.params.subscribe(params => {
      const gotoParam = params['id']; // Asumiendo que el parámetro se llama 'id' en tu ruta
      if (gotoParam) {
        this.currentGoto = gotoParam;
        this.loadCourseByGoto(gotoParam);
      }
    });
  }

  ngOnInit(): void {}

  /**
   * Carga un curso usando el parámetro goto de la URL
   * Primero obtiene el ID del endpoint y luego carga el curso completo
   */
  loadCourseByGoto(gotoParam: string): void {
    this.loading = true;
    this.error = null;
    
    // Primero obtenemos el ID desde el endpoint
    this.coursesService.getCourseIdByGoto(gotoParam).subscribe({
      next: (response) => {
        const courseId = response.id;
        // Ahora cargamos el curso completo usando el ID
        this.loadCourseById(courseId);
      },
      error: (error) => {
        this.handleCourseDataError(error, gotoParam);
      }
    });
  }

  /**
   * Carga un curso por su ID
   */
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

  private handleCourseDataError(error: any, requestedGoto: string): void {
    console.error('Error loading course data:', error);
    this.error = error.message || 'Error al cargar el curso';
    this.loading = false;
    
    // Si no es el curso de introducción, intentar cargar ese como fallback
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

  /**
   * Método para obtener información del curso actual
   */
  getCurrentCourseInfo(): CursoDisponible | null {
    return this.coursesService.getCourseInfoByGoto(this.currentGoto);
  }
}