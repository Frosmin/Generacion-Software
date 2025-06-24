import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormCourseComponent } from '../../components/form-course/form-course.component';

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
    private route: ActivatedRoute
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

      // Cargar datos del curso
      this.initialCourseData = await this.fetchCourseData(this.courseId);
      this.currentCourseData = JSON.parse(JSON.stringify(this.initialCourseData)); // Deep copy
      
      
    } catch (error) {
      console.error('Error al cargar el curso:', error);
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchCourseData(courseId: string): Promise<CourseData> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito o error
        const success = Math.random() > 0.1;
        
        if (success) {
          // Mock data basado en el formato JSON
          const mockCourseData: CourseData = {
        course: {
            title: "afsafasfa",
            description: "safagsgsgsaggas",
            goto: "afsafasfa"
        },
        contents: [
            {
            title: "agsgasagsgsag",
            paragraph: [
                "asgasgaasg"
            ],
            subcontent: [
                {
                subtitle: "afavvqeqveqve",
                subparagraph: [
                    "qvevqevqeqveqve"
                ],
                example: [
                    {
                    code: "142124dv"
                    },
                    {
                    code: "dsvsdvdvsd112215"
                    }
                ]
                }
            ],
            next: "fqefqffqw",
            maxResourceConsumption: 123,
            maxProcessingTime: 421
            },
            {
            title: "fqefqffqw",
            paragraph: [
                "12wfqfeveqvqqve"
            ],
            subcontent: [
                {
                subtitle: "qwrwqrqwr",
                subparagraph: [
                    "qwrwrqqwr"
                ],
                example: [
                    {
                    code: "qwrqw"
                    }
                ]
                }
            ],
            next: null,
            maxResourceConsumption: 124,
            maxProcessingTime: 531
            }
        ]
        };
          resolve(mockCourseData);
        } else {
          reject(new Error('No se pudo cargar el curso'));
        }
      }, 1500); // Simular 1.5 segundos de carga
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

  // Enviar formulario
  async onSubmit(): Promise<void> {
    if (!this.isFormValid || !this.currentCourseData || !this.hasChanges) {
      console.error('Formulario inválido, sin datos o sin cambios');
      return;
    }

    this.isSubmitting = true;

    try {
      // Simular una llamada asíncrona
      await this.updateCourse(this.courseId!, this.currentCourseData);
      
      // Actualizar datos iniciales después del guardado exitoso
      this.initialCourseData = JSON.parse(JSON.stringify(this.currentCourseData));
      this.hasChanges = false;
      
      alert('¡Curso actualizado exitosamente!');
      this.router.navigate(['/cursos']);
      
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      alert('Error al actualizar el curso. Por favor, inténtalo de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Simular actualización del curso
  private async updateCourse(courseId: string, courseData: CourseData): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito o error
        const success = Math.random() > 0.1;
        
        if (success) {
          resolve();
        } else {
          reject(new Error('Error simulado en el servidor'));
        }
      }, 2000); // Simular 2 segundos de carga
    });
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

  // Método para obtener datos del curso pa debugging
  getCourseData(): CourseData | undefined {
    return this.currentCourseData;
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
}