import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError, of, switchMap } from 'rxjs';
import { ICardCurso } from '../shared/interfaces/interfaces';

interface BasicCourseResponse {
  id: number;
  title: string;
  description: string;
  goto: string;
}

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
  maxResourceConsumption?: number;
  maxProcessingTime?: number;
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

interface CourseIdResponse {
  id: number;
}

// Interface para crear un nuevo curso
interface CreateCourseRequest {
  course: {
    title: string;
    description: string;
    goto: string;
  };
  contents: CreateCourseContent[];
}

interface CreateCourseContent {
  title: string;
  paragraph: string[];
  subcontent: CreateSubContent[];
  next: string | null;
  maxResourceConsumption: number;
  maxProcessingTime: number;
}

interface CreateSubContent {
  subtitle: string;
  subparagraph: string[];
  example: CreateExampleContent[];
}

interface CreateExampleContent {
  code: string;
}

// Interface para actualizar un curso
interface UpdateCourseRequest {
  course: {
    title: string;
    description: string;
    goto: string;
  };
  contents: UpdateCourseContent[];
}

interface UpdateCourseContent {
  title: string;
  paragraph: string[];
  subcontent: UpdateSubContent[];
  next: string | null;
  maxResourceConsumption: number;
  maxProcessingTime: number;
}

interface UpdateSubContent {
  subtitle: string;
  subparagraph: string[];
  example: UpdateExampleContent[];
}

interface UpdateExampleContent {
  code: string;
}

// Interface para la respuesta de creación/actualización
interface CourseResponse {
  message: string;
  course_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly cursosDisponibles: CursoDisponible[] = [
    { id: 2, nombre: 'Introducción', goto: 'intro', description: 'Panorama general de la programación y conceptos básicos.' },
    { id: 3, nombre: 'Flujos de Control', goto: 'flujos', description: 'Control de flujo en programación.' },
    { id: 4, nombre: 'Funciones', goto: 'funciones', description: 'Creación y uso de funciones.' },
    { id: 5, nombre: 'Estructuras de Datos', goto: 'datos', description: 'Listas, diccionarios y más.' },
    { id: 6, nombre: 'POO', goto: 'poo', description: 'Programación Orientada a Objetos.' },
    { id: 7, nombre: 'Archivos', goto: 'files', description: 'Manejo de archivos.' }
  ];

  constructor(private http: HttpClient) {}

  // Crear un nuevo curso
  createCourse(courseData: CreateCourseRequest): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(`${this.baseUrl}/courses`, courseData).pipe(
      catchError(this.handleError)
    );
  }

  // NUEVO: Actualizar un curso existente
  updateCourse(courseId: number, courseData: UpdateCourseRequest): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(`${this.baseUrl}/courses/${courseId}`, courseData).pipe(
      catchError(this.handleError)
    );
  }

  // NUEVO: Eliminar un curso
  deleteCourse(courseId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/courses/${courseId}`).pipe(
      catchError(this.handleError)
    );
  }

  getBasicCourses(): Observable<ICardCurso[]> {
    return this.http.get<BasicCourseResponse[]>(`${this.baseUrl}/courses/info`).pipe(
      map(response => 
        response.map(course => ({
          id: course.id,       
          title: course.title,
          description: course.description,
          goto: course.goto
        }))
      ),
      catchError(this.handleError)
    );
  }

  getAllCourses(): Observable<CourseData[]> {
    return this.http.get<CourseData[]>(`${this.baseUrl}/courses`).pipe(
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<CourseData> {
    return this.http.get<CourseData>(`${this.baseUrl}/courses/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getCourseIdByGoto(gotoId: string): Observable<CourseIdResponse> {
    return this.http.get<CourseIdResponse>(`${this.baseUrl}/course/${gotoId}`).pipe(
      catchError(this.handleError)
    );
  }

  getCourseByGoto(gotoId: string): Observable<CourseData> {
    return this.getCourseIdByGoto(gotoId).pipe(
      map(response => response.id),
      switchMap(courseId => this.getCourseById(courseId)),
      catchError(this.handleError)
    );
  }

  getCourseContent(courseId: number, contentId: number): Observable<ContenidoCurso | null> {
    return this.getCourseById(courseId).pipe(
      map(courseData => {
        const content = courseData.contents.find(c => c.id === contentId);
        return content || null;
      })
    );
  }

  searchCourses(query: string): Observable<ICardCurso[]> {
    return this.getBasicCourses().pipe(
      map(courses => 
        courses.filter(course => 
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  getCourseTitles(courseId: number): Observable<string[]> {
    return this.getCourseById(courseId).pipe(
      map(courseData => courseData.contents.map(content => content.title))
    );
  }

  getNextContent(courseId: number, currentContentId: number): Observable<ContenidoCurso | null> {
    return this.getCourseById(courseId).pipe(
      map(courseData => {
        const currentIndex = courseData.contents.findIndex(c => c.id === currentContentId);
        if (currentIndex !== -1 && currentIndex < courseData.contents.length - 1) {
          return courseData.contents[currentIndex + 1];
        }
        return null;
      })
    );
  }

  getPreviousContent(courseId: number, currentContentId: number): Observable<ContenidoCurso | null> {
    return this.getCourseById(courseId).pipe(
      map(courseData => {
        const currentIndex = courseData.contents.findIndex(c => c.id === currentContentId);
        if (currentIndex > 0) {
          return courseData.contents[currentIndex - 1];
        }
        return null;
      })
    );
  }

  courseExists(courseId: number): Observable<boolean> {
    return this.getCourseById(courseId).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getAvailableCourses(): CursoDisponible[] {
    return [...this.cursosDisponibles];
  }

  private getCourseIdByGotoLocal(gotoId: string): number | null {
    const curso = this.cursosDisponibles.find(c => c.goto === gotoId);
    return curso ? curso.id : null;
  }

  getGotoById(courseId: number): string | null {
    const curso = this.cursosDisponibles.find(c => c.id === courseId);
    return curso ? curso.goto : null;
  }

  getCourseInfoByGoto(gotoId: string): CursoDisponible | null {
    return this.cursosDisponibles.find(c => c.goto === gotoId) || null;
  }

  validateCourseStructure(courseData: CourseData): boolean {
    if (!courseData.course || !courseData.contents) {
      return false;
    }
    if (!Array.isArray(courseData.contents) || courseData.contents.length === 0) {
      return false;
    }
    return courseData.contents.every(content => 
      content.id && 
      content.title && 
      Array.isArray(content.paragraph) &&
      Array.isArray(content.subcontent)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos enviados al servidor';
          break;
        case 404:
          errorMessage = 'Curso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }
    console.error('Error en CoursesService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}