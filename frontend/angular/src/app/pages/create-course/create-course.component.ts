import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormCourseComponent } from '../../components/form-course/form-course.component';
import { CoursesService } from '../../services/courses.service';

// Interfaces para el tipado de datos
interface CourseData {
  course: {
    title: string;
    description: string;
    goto: string;
  };
  contents: ContentData[];
}

interface ContentData {
  title: string;
  paragraph: string[];
  subcontent: SubcontentData[];
  next: string | null;
  maxResourceConsumption: number;
  maxProcessingTime: number;
}

interface SubcontentData {
  subtitle: string;
  subparagraph: string[];
  example: ExampleData[];
}

interface ExampleData {
  code: string;
}

// Interface para la creación de curso (compatible con el servicio)
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

@Component({
  selector: 'app-create-course',
  standalone: true,
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
  imports: [CommonModule, FormCourseComponent]
})
export class CreateCourseComponent {
  // Estados del componente
  isSubmitting = false;
  isFormValid = false;
  showPreview = false;
  hasError = false;
  errorMessage = '';
  currentCourseData: CourseData | null = null;

  constructor(
    private router: Router,
    private coursesService: CoursesService
  ) {}

  // Manejar cambios en los datos del formulario
  onFormDataChange(courseData: CourseData): void {
    this.currentCourseData = courseData;
    this.hasError = false; // Limpiar errores cuando cambian los datos
  }

  // Manejar cambios en la validez del formulario
  onFormValidChange(isValid: boolean): void {
    this.isFormValid = isValid;
  }

  // Alternar vista previa del JSON
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Enviar formulario
  async onSubmit(): Promise<void> {
    if (!this.isFormValid || !this.currentCourseData) {
      console.error('Formulario inválido o sin datos', {
        isFormValid: this.isFormValid,
        hasData: !!this.currentCourseData
      });
      return;
    }

    this.isSubmitting = true;
    this.hasError = false;

    try {
      // Validar datos antes de enviar
      if (!this.validateCourseData(this.currentCourseData)) {
        throw new Error('Datos del curso inválidos');
      }

      // Transformar datos al formato esperado por la API
      const createRequest = this.transformCourseDataForCreation(this.currentCourseData);
      
      console.log('Datos que se enviarán al servidor:', JSON.stringify(createRequest, null, 2));

      // Llamar al servicio para crear el curso
      await this.createCourse(createRequest);
      
      alert('¡Curso creado exitosamente!');
      this.router.navigate(['/cursos']);
      
    } catch (error) {
      console.error('Error al crear el curso:', error);
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al crear el curso: ${this.errorMessage}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Validar datos del curso
  private validateCourseData(courseData: CourseData): boolean {
    if (!courseData.course) {
      console.error('Datos del curso faltantes');
      return false;
    }

    if (!courseData.course.title || !courseData.course.description || !courseData.course.goto) {
      console.error('Campos requeridos del curso faltantes');
      return false;
    }

    if (!Array.isArray(courseData.contents) || courseData.contents.length === 0) {
      console.error('Contenidos del curso faltantes o vacíos');
      return false;
    }

    // Validar cada contenido
    for (const content of courseData.contents) {
      if (!content.title) {
        console.error('Título del contenido faltante');
        return false;
      }

      if (!Array.isArray(content.paragraph)) {
        console.error('Párrafos del contenido deben ser un array');
        return false;
      }

      if (!Array.isArray(content.subcontent)) {
        console.error('Subcontenidos deben ser un array');
        return false;
      }

      // Validar subcontenidos
      for (const sub of content.subcontent) {
        if (!sub.subtitle || !Array.isArray(sub.subparagraph) || !Array.isArray(sub.example)) {
          console.error('Estructura de subcontenido inválida');
          return false;
        }
      }
    }

    return true;
  }

  // Transformar datos para la creación
  private transformCourseDataForCreation(courseData: CourseData): CreateCourseRequest {
    return {
      course: {
        title: courseData.course.title.trim(),
        description: courseData.course.description.trim(),
        goto: courseData.course.goto.trim()
      },
      contents: courseData.contents.map(content => ({
        title: content.title.trim(),
        paragraph: content.paragraph.filter(p => p.trim() !== ''),
        subcontent: content.subcontent.map(sub => ({
          subtitle: sub.subtitle.trim(),
          subparagraph: sub.subparagraph.filter(sp => sp.trim() !== ''),
          example: sub.example.map(ex => ({
            code: ex.code.trim()
          }))
        })),
        next: content.next?.trim() || null,
        maxResourceConsumption: Number(content.maxResourceConsumption) || 100,
        maxProcessingTime: Number(content.maxProcessingTime) || 5000
      }))
    };
  }

  // Crear curso usando el coursesService
  private async createCourse(courseData: CreateCourseRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.coursesService.createCourse(courseData).subscribe({
        next: (response) => {
          console.log('Curso creado exitosamente:', response);
          resolve();
        },
        error: (error) => {
          console.error('Error detallado del servidor:', error);
          
          // Proporcionar más información sobre el error
          let errorMessage = 'Error interno del servidor';
          if (error.error && typeof error.error === 'object') {
            errorMessage = error.error.message || error.error.error || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          reject(new Error(errorMessage));
        }
      });
    });
  }

  // Cancelar creación
  onCancel(): void {
    const hasChanges = this.currentCourseData !== null;
    
    if (hasChanges) {
      const confirmLeave = confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.');
      if (!confirmLeave) {
        return;
      }
    }

    this.router.navigate(['/cursos']);
  }

  // Reintentar en caso de error
  onRetry(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.onSubmit();
  }

  // Método para obtener datos del curso para debugging
  getCourseData(): CourseData | null {
    return this.currentCourseData;
  }

  // Getters para el template
  get hasFormData(): boolean {
    return this.currentCourseData !== null;
  }

  get canSubmit(): boolean {
    return this.isFormValid && this.hasFormData && !this.isSubmitting;
  }

  get hasFormError(): boolean {
    return this.hasError;
  }
}