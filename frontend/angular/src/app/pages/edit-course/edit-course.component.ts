import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormCourseComponent } from '../../components/form-course/form-course.component';
import { CoursesService } from '../../services/courses.service';

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

// Interface para actualización parcial (campos opcionales)
interface PartialUpdateCourseRequest {
  course?: {
    title?: string;
    description?: string;
    goto?: string;
  };
  contents?: PartialUpdateContentData[];
}

interface PartialUpdateContentData {
  title?: string;
  paragraph?: string[];
  subcontent?: PartialUpdateSubcontentData[];
  next?: string | null;
  maxResourceConsumption?: number;
  maxProcessingTime?: number;
}

interface PartialUpdateSubcontentData {
  subtitle?: string;
  subparagraph?: string[];
  example?: PartialUpdateExampleData[];
}

interface PartialUpdateExampleData {
  code?: string;
}

// Interface completa (para compatibilidad con el servicio actual)
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

  // Configuración para actualizaciones parciales
  enablePartialUpdates = true;

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
                example: Array.isArray(sub.example) ? sub.example.map((ex: any) => {
                  if (typeof ex === 'string') {
                    return { code: ex };
                  } else if (typeof ex === 'object' && ex !== null) {
                    return { code: ex.code || String(ex) };
                  } else {
                    return { code: String(ex) };
                  }
                }) : []
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

  // Detectar cambios específicos para actualizaciones parciales
  private detectChanges(): PartialUpdateCourseRequest {
    if (!this.initialCourseData || !this.currentCourseData) {
      return {};
    }

    const changes: PartialUpdateCourseRequest = {};

    // Verificar cambios en el curso
    const courseChanges: any = {};
    if (this.initialCourseData.course.title !== this.currentCourseData.course.title) {
      courseChanges.title = this.currentCourseData.course.title.trim();
    }
    if (this.initialCourseData.course.description !== this.currentCourseData.course.description) {
      courseChanges.description = this.currentCourseData.course.description.trim();
    }
    if (this.initialCourseData.course.goto !== this.currentCourseData.course.goto) {
      courseChanges.goto = this.currentCourseData.course.goto.trim();
    }

    if (Object.keys(courseChanges).length > 0) {
      changes.course = courseChanges;
    }

    // Verificar cambios en contenidos
    const initialContentsJson = JSON.stringify(this.initialCourseData.contents);
    const currentContentsJson = JSON.stringify(this.currentCourseData.contents);

    if (initialContentsJson !== currentContentsJson) {
      // Para simplificar, si hay cambios en contenidos, enviamos todos
      // En una implementación más avanzada, podrías detectar cambios específicos por contenido
      changes.contents = this.transformContentsForUpdate(this.currentCourseData.contents);
    }

    return changes;
  }

  // Alternar vista previa del JSON
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Enviar formulario con actualizaciones parciales o completas
  async onSubmit(): Promise<void> {
    if (!this.isFormValid || !this.currentCourseData || !this.hasChanges) {
      console.error('Formulario inválido, sin datos o sin cambios', {
        isFormValid: this.isFormValid,
        hasData: !!this.currentCourseData,
        hasChanges: this.hasChanges
      });
      return;
    }

    this.isSubmitting = true;

    try {
      let updateRequest: UpdateCourseRequest;

      if (this.enablePartialUpdates) {
        // Detectar solo los cambios y crear un request parcial
        const partialChanges = this.detectChanges();
        console.log('Cambios detectados:', JSON.stringify(partialChanges, null, 2));

        // Convertir a formato completo para el servicio actual
        updateRequest = this.convertPartialToFull(partialChanges);
      } else {
        // Enviar todos los datos (comportamiento anterior)
        updateRequest = this.transformCourseDataForUpdate(this.currentCourseData);
      }

      // Validar datos antes de enviar
      if (!this.validateCourseData(this.currentCourseData)) {
        throw new Error('Datos del curso inválidos');
      }

      console.log('Datos que se enviarán al servidor:', JSON.stringify(updateRequest, null, 2));

      await this.updateCourse(parseInt(this.courseId!, 10), updateRequest);
      
      // Actualizar datos iniciales después del guardado exitoso
      this.initialCourseData = JSON.parse(JSON.stringify(this.currentCourseData));
      this.hasChanges = false;
      
      alert('¡Curso actualizado exitosamente!');
      this.router.navigate(['/cursos']);
      
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar el curso: ${errorMessage}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Convertir cambios parciales a formato completo (para compatibilidad con API actual)
  private convertPartialToFull(partialChanges: PartialUpdateCourseRequest): UpdateCourseRequest {
  if (!this.currentCourseData) {
    throw new Error('No hay datos del curso actual');
  }

  return {
    course: {
      title: partialChanges.course?.title ?? this.currentCourseData.course.title,
      description: partialChanges.course?.description ?? this.currentCourseData.course.description,
      goto: partialChanges.course?.goto ?? this.currentCourseData.course.goto
    },
    contents: partialChanges.contents 
      ? this.convertPartialContentsToFull(partialChanges.contents)
      : this.transformContentsForUpdate(this.currentCourseData.contents)
  };
}

// Helper method to convert partial contents to full contents
private convertPartialContentsToFull(partialContents: PartialUpdateContentData[]): UpdateContentData[] {
  if (!this.currentCourseData) {
    throw new Error('No hay datos del curso actual');
  }

  return partialContents.map((partialContent, index) => {
    const currentContent = this.currentCourseData!.contents[index];
    
    if (!currentContent) {
      throw new Error(`Contenido en índice ${index} no encontrado`);
    }

    return {
      title: partialContent.title ?? currentContent.title,
      paragraph: partialContent.paragraph ?? currentContent.paragraph,
      subcontent: partialContent.subcontent 
        ? this.convertPartialSubcontentsToFull(partialContent.subcontent, currentContent.subcontent)
        : currentContent.subcontent.map(sub => ({
            subtitle: sub.subtitle,
            subparagraph: sub.subparagraph,
            example: sub.example.map(ex => ({ code: ex.code }))
          })),
      next: partialContent.next !== undefined ? partialContent.next : currentContent.next,
      maxResourceConsumption: partialContent.maxResourceConsumption ?? currentContent.maxResourceConsumption,
      maxProcessingTime: partialContent.maxProcessingTime ?? currentContent.maxProcessingTime
    };
  });
}

// Helper method to convert partial subcontents to full subcontents
private convertPartialSubcontentsToFull(
  partialSubcontents: PartialUpdateSubcontentData[], 
  currentSubcontents: SubcontentData[]
): UpdateSubcontentData[] {
  return partialSubcontents.map((partialSub, index) => {
    const currentSub = currentSubcontents[index];
    
    if (!currentSub) {
      throw new Error(`Subcontenido en índice ${index} no encontrado`);
    }

    return {
      subtitle: partialSub.subtitle ?? currentSub.subtitle,
      subparagraph: partialSub.subparagraph ?? currentSub.subparagraph,
      example: partialSub.example 
        ? partialSub.example.map((partialEx, exIndex) => ({
            code: partialEx.code ?? currentSub.example[exIndex]?.code ?? ''
          }))
        : currentSub.example.map(ex => ({ code: ex.code }))
    };
  });
}

  // Transformar contenidos para actualización
  private transformContentsForUpdate(contents: ContentData[]): UpdateContentData[] {
    return contents.map(content => ({
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
    }));
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

  // Transformar datos para la actualización (método legacy)
  private transformCourseDataForUpdate(courseData: CourseData): UpdateCourseRequest {
    return {
      course: {
        title: courseData.course.title.trim(),
        description: courseData.course.description.trim(),
        goto: courseData.course.goto.trim()
      },
      contents: this.transformContentsForUpdate(courseData.contents)
    };
  }

  // Actualizar curso usando el coursesService
  private async updateCourse(courseId: number, courseData: UpdateCourseRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.coursesService.updateCourse(courseId, courseData).subscribe({
        next: (response) => {
          console.log('Curso actualizado exitosamente:', response);
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

  // Alternar modo de actualización
  togglePartialUpdates(): void {
    this.enablePartialUpdates = !this.enablePartialUpdates;
    console.log('Actualizaciones parciales:', this.enablePartialUpdates ? 'Habilitadas' : 'Deshabilitadas');
  }

  // Cancelar edición
  onCancel(): void {
    if (this.hasChanges) {
      const confirmLeave = confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados.');
      if (!confirmLeave) {
        return;
      }
    }

    this.router.navigate(['/cursos']);
  }

  // Reintentar carga de datos
  onRetry(): void {
    this.loadCourseData();
  }

  // Método para obtener datos del curso para debugging
  getCourseData(): CourseData | undefined {
    return this.currentCourseData;
  }

  // Obtener cambios detectados para debugging
  getDetectedChanges(): PartialUpdateCourseRequest {
    return this.detectChanges();
  }

  // Verificar si hay cambios pendientes
  get hasPendingChanges(): boolean {
    return this.hasChanges;
  }

  // Obtener estado de carga
  get isLoadingData(): boolean {
    return this.isLoading;
  }

  // Obtener estado de error
  get hasLoadingError(): boolean {
    return this.hasError;
  }

  // Obtener modo de actualización
  get isPartialUpdateMode(): boolean {
    return this.enablePartialUpdates;
  }
}