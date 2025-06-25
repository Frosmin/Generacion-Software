import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormCourseComponent } from '../../components/form-course/form-course.component';
import { CoursesService } from '../../services/courses.service';

import { HttpErrorResponse } from '@angular/common/http';


// Interfaces para el tipado de datos
interface CourseData {
  course: {
    id?: number;
    title: string;
    description: string;
    goto: string;
  };
  contents: ContentData[];
}

interface ContentData {
  id?: number;
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

// Interface para actualización completa (PUT) - ÚNICA INTERFACE DE ACTUALIZACIÓN
interface UpdateCourseRequest {
  course: {
    title: string;
    description: string;
    goto: string;
  };
  contents: UpdateContentData[];
}

interface UpdateContentData {
  title: string;
  paragraph: string[];
  subcontent: UpdateSubcontentData[];
  next: string | null;
  maxResourceConsumption: number;
  maxProcessingTime: number;
}

interface UpdateSubcontentData {
  subtitle: string;
  subparagraph: string[];
  example: UpdateExampleData[];
}

interface UpdateExampleData {
  code: string;
}

// Interface para el resultado de validación
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Component({
  selector: 'app-edit-course',
  standalone: true,
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss'],
  imports: [CommonModule, FormCourseComponent]
})
export class EditCourseComponent implements OnInit {
  // Estados del componente
  isSubmitting = false;
  isFormValid = false;
  showPreview = false;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  hasChanges = false;
  
  // Datos del curso
  courseId: string | null = null;
  initialCourseData: CourseData | undefined = undefined;
  currentCourseData: CourseData | undefined = undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {}

  ngOnInit(): void {
    this.loadCourseData();
  }

  // Cargar datos del curso desde la ruta
  private async loadCourseData(): Promise<void> {
    try {
      this.isLoading = true;
      this.hasError = false;
      
      // Obtener ID del curso desde la ruta
      this.courseId = this.route.snapshot.paramMap.get('id');
      
      if (!this.courseId) {
        throw new Error('ID del curso no encontrado');
      }

      // Validar que el ID sea un número válido
      const numericId = parseInt(this.courseId, 10);
      if (isNaN(numericId)) {
        throw new Error('ID del curso inválido');
      }

      // Cargar datos del curso desde la API
      this.initialCourseData = await this.fetchCourseData(numericId);
      this.currentCourseData = JSON.parse(JSON.stringify(this.initialCourseData)); // Deep copy
      
    } catch (error) {
      console.error('Error al cargar el curso:', error);
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    } finally {
      this.isLoading = false;
    }
  }

  

private async fetchCourseData(courseId: number): Promise<CourseData> {
 return new Promise((resolve, reject) => {
this.coursesService.getCourseById(courseId).subscribe({
 next: (courseData) => {
 const transformedData: CourseData = {
course: {
id: courseData.course.id,
title: courseData.course.title,
description: courseData.course.description,
goto: courseData.course.goto
},
contents: courseData.contents.map(content => ({
id: content.id,
title: content.title,
 paragraph: Array.isArray(content.paragraph) ? content.paragraph : [],
subcontent: Array.isArray(content.subcontent) ? content.subcontent.map(sub => ({
 subtitle: sub.subtitle || '',
 subparagraph: Array.isArray(sub.subparagraph) ? sub.subparagraph : [],
example: Array.isArray(sub.example)
? sub.example.map((ex: string | { code?: string } | object) => {
if (typeof ex === 'string') {
return { code: ex };
 } else if (typeof ex === 'object' && ex !== null && 'code' in ex) {
 return { code: (ex as { code?: string }).code || String(ex) };
} else {
 return { code: JSON.stringify(ex) };
}
})
: []
})) : [],
next: content.next || null,
maxResourceConsumption: content.maxResourceConsumption || 100,
maxProcessingTime: content.maxProcessingTime || 5000
 }))
};

 console.log('Datos transformados:', transformedData);
resolve(transformedData);
 },
error: (error) => {
console.error('Error al obtener el curso:', error);
reject(new Error('No se pudo cargar el curso: ' + error.message));
}
 });
});
}



  // Manejar cambios en los datos del formulario
  onFormDataChange(courseData: CourseData): void {
    this.currentCourseData = courseData;
    this.checkForChanges();
  }

  // Manejar cambios en la validez del formulario
  onFormValidChange(isValid: boolean): void {
    this.isFormValid = isValid;
  }

  // Verificar si hay cambios en el formulario
  private checkForChanges(): void {
    if (!this.initialCourseData || !this.currentCourseData) {
      this.hasChanges = false;
      return;
    }

    const initialJson = JSON.stringify(this.initialCourseData);
    const currentJson = JSON.stringify(this.currentCourseData);
    this.hasChanges = initialJson !== currentJson;
  }

  // Alternar vista previa del JSON
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Cancelar edición y volver a la lista de cursos
  onCancel(): void {
    // Si hay cambios sin guardar, mostrar confirmación
    if (this.hasChanges) {
      const confirmCancel = confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?'
      );
      
      if (!confirmCancel) {
        return; // El usuario decidió no cancelar
      }
    }

    // Navegar de vuelta a la lista de cursos
    this.router.navigate(['/cursos']);
  }

 

  // FUNCIÓN DE ENVÍO DE FORMULARIO - SOLO USA PUT
 // FUNCIÓN DE ENVÍO DE FORMULARIO MEJORADA - SOLO USA PUT
async onSubmit(): Promise<void> {
  // Validación previa al envío
  const validation = this.preSubmitValidation();
  if (!validation.isValid) {
    console.error('Validación previa falló:', validation.errors);
    alert(`No se puede enviar el formulario:\n${validation.errors.join('\n')}`);
    return;
  }

  this.isSubmitting = true;

  try {
    const courseId = parseInt(this.courseId!, 10);
    
    // Transformar datos para el formato requerido por el backend
    const fullUpdateData = this.transformCourseDataForUpdate(this.currentCourseData!);
    
    console.log('=== DATOS ENVIADOS AL BACKEND ===');
    console.log('Course ID:', courseId);
    console.log('Datos completos (PUT):', JSON.stringify(fullUpdateData, null, 2));

    // Usar únicamente actualización completa (PUT)
    await this.updateCourse(courseId, fullUpdateData);
    
    // Actualizar datos iniciales después del guardado exitoso
    this.initialCourseData = JSON.parse(JSON.stringify(this.currentCourseData));
    this.hasChanges = false;
    
    alert('¡Curso actualizado exitosamente!');
    this.router.navigate(['/cursos']);
    
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    const errorMessage = this.handleNetworkError(error);
    alert(`Error al actualizar el curso: ${errorMessage}`);
  } finally {
    this.isSubmitting = false;
  }
}

// TRANSFORMACIÓN MEJORADA PARA PUT
private transformCourseDataForUpdate(courseData: CourseData): UpdateCourseRequest {
  console.log('=== TRANSFORMANDO DATOS ===');
  console.log('Datos originales:', courseData);
  
  const transformed = {
    course: {
      title: courseData.course.title.trim(),
      description: courseData.course.description.trim(),  
      goto: courseData.course.goto.trim()
    },
    contents: courseData.contents.map((content, index) => {
      console.log(`Procesando contenido ${index + 1}:`, content);
      
      return {
        title: content.title.trim(),
        paragraph: content.paragraph
          .filter(p => p && p.trim() !== '')
          .map(p => p.trim()),
        subcontent: content.subcontent.map((sub, subIndex) => {
          console.log(`  Procesando subcontenido ${subIndex + 1}:`, sub);
          
          return {
            subtitle: sub.subtitle.trim(),
            subparagraph: sub.subparagraph
              .filter(sp => sp && sp.trim() !== '')
              .map(sp => sp.trim()),
            example: sub.example.map((ex, exIndex) => {
              console.log(`    Procesando ejemplo ${exIndex + 1}:`, ex);
              return {
                code: (ex.code || '').trim()
              };
            })
          };
        }),
        next: content.next && content.next.trim() !== '' ? content.next.trim() : null,
        maxResourceConsumption: Number(content.maxResourceConsumption) || 100,
        maxProcessingTime: Number(content.maxProcessingTime) || 5000
      };
    })
  };
  
  console.log('Datos transformados:', transformed);
  return transformed;
}

// VALIDACIÓN PREVIA MEJORADA
private preSubmitValidation(): ValidationResult {
  const errors: string[] = [];

  // Verificar que los datos actuales existan
  if (!this.currentCourseData) {
    errors.push('No hay datos del curso para validar');
    return { isValid: false, errors };
  }

  console.log('=== VALIDANDO DATOS ===');
  console.log('Datos a validar:', this.currentCourseData);

  // Validar datos del curso
  const course = this.currentCourseData.course;
  if (!course.title || course.title.trim().length === 0) {
    errors.push('El título del curso es requerido');
  }
  if (!course.description || course.description.trim().length === 0) {
    errors.push('La descripción del curso es requerida');
  }
  if (!course.goto || course.goto.trim().length === 0) {
    errors.push('La URL del curso (goto) es requerida');
  }

  // Validar contenidos
  if (!this.currentCourseData.contents || this.currentCourseData.contents.length === 0) {
    errors.push('El curso debe tener al menos un contenido');
  } else {
    this.currentCourseData.contents.forEach((content, index) => {
      if (!content.title || content.title.trim().length === 0) {
        errors.push(`El contenido ${index + 1} debe tener un título`);
      }
      if (!content.paragraph || content.paragraph.length === 0 || 
          content.paragraph.every(p => !p || p.trim() === '')) {
        errors.push(`El contenido ${index + 1} debe tener al menos un párrafo válido`);
      }
      if (!content.maxResourceConsumption || content.maxResourceConsumption <= 0) {
        errors.push(`El contenido ${index + 1} debe tener un consumo máximo de recursos válido`);
      }
      if (!content.maxProcessingTime || content.maxProcessingTime <= 0) {
        errors.push(`El contenido ${index + 1} debe tener un tiempo máximo de procesamiento válido`);
      }

      // Validar subcontenidos si existen
      if (content.subcontent && content.subcontent.length > 0) {
        content.subcontent.forEach((subcontent, subIndex) => {
          if (!subcontent.subtitle || subcontent.subtitle.trim().length === 0) {
            errors.push(`El subcontenido ${subIndex + 1} del contenido ${index + 1} debe tener un subtítulo`);
          }
        });
      }
    });
  }

  // Verificar que el formulario sea válido según el componente hijo
  if (!this.isFormValid) {
    errors.push('El formulario contiene errores de validación');
  }

  // Verificar que haya cambios para guardar
  if (!this.hasChanges) {
    errors.push('No hay cambios para guardar');
  }

  console.log('Errores de validación:', errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// LLAMADA AL SERVICIO MEJORADA
private async updateCourse(courseId: number, courseData: UpdateCourseRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('=== ENVIANDO SOLICITUD PUT ===');
    console.log('URL:', `courses/${courseId}`);
    console.log('Datos:', JSON.stringify(courseData, null, 2));
    
    this.coursesService.updateCourse(courseId, courseData).subscribe({
      next: (response) => {
        console.log('=== RESPUESTA EXITOSA ===');
        console.log('Respuesta del servidor:', response);
        resolve();
      },
      error: (error) => {
        console.error('=== ERROR EN SOLICITUD ===');
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        reject(error);
      }
    });
  });
}

  // Manejar errores de red
  private handleNetworkError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Datos inválidos enviados al servidor';
        case 401:
          return 'No autorizado - verifica tu sesión';
        case 403:
          return 'No tienes permisos para realizar esta acción';
        case 404:
          return 'Curso no encontrado';
        case 500:
          return 'Error interno del servidor';
        default:
          return `Error del servidor (${error.status})`;
      }
    }
    }
    
    return 'Error de conexión con el servidor';
  }
}