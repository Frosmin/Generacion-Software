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
}

interface SubcontentData {
  subtitle: string;
  subparagraph: string[];
  example: ExampleData[];
}

interface ExampleData {
  code: string;
  maxResourceConsumption: number;
  maxProcessingTime: number;
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

      // AQUI CARGAR LOS DATOS DEL CURSO
      this.initialCourseData = await this.fetchCourseData(this.courseId);
      this.currentCourseData = JSON.parse(JSON.stringify(this.initialCourseData)); // Deep copy
      
      console.log('Datos del curso cargados:', this.initialCourseData);
      
    } catch (error) {
      console.error('Error al cargar el curso:', error);
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    } finally {
      this.isLoading = false;
    }
  }

  // Simular carga de datos del curso (reemplaza con tu lógica real)
  private async fetchCourseData(courseId: string): Promise<CourseData> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito o error
        const success = Math.random() > 0.1; // 90% de probabilidad de éxito
        
        if (success) {
          // Mock data basado en el formato JSON que proporcionaste
          const mockCourseData: CourseData = {
              course: {
                    title: "askfjsafkj",
                    description: "kkjafsfakjkjfskjsfkj",
                    goto: "askfjsafkj"
                },
                contents: [
                    {
                    title: "puebads",
                    paragraph: [
                        "ndjkgandga"
                    ],
                    subcontent: [
                        {
                        subtitle: "vkjadkjvnkjad",
                        subparagraph: [
                            "kjadavknjajdknj"
                        ],
                        example: [
                            {
                            code: "djvanjkdvnkja",
                            maxResourceConsumption: 124,
                            maxProcessingTime: 12531
                            },
                            {
                            code: "scas",
                            maxResourceConsumption: 124,
                            maxProcessingTime: 214
                            },
                            {
                            code: "39519",
                            maxResourceConsumption: 8462,
                            maxProcessingTime: 1358
                            }
                        ]
                        },
                        {
                        subtitle: "adkjakjdgkj",
                        subparagraph: [
                            "kdgkjkjag"
                        ],
                        example: [
                            {
                            code: "akgjkajgkj",
                            maxResourceConsumption: 853,
                            maxProcessingTime: 8135
                            }
                        ]
                        }
                    ],
                    next: "asgn"
                    },
                    {
                    title: "asgn",
                    paragraph: [
                        "kdkjkjgnenkj"
                    ],
                    subcontent: [
                        {
                        subtitle: "agkjganjk",
                        subparagraph: [
                            "kjasgsag"
                        ],
                        example: [
                            {
                            code: "15",
                            maxResourceConsumption: 215,
                            maxProcessingTime: 4624
                            }
                        ]
                        }
                    ],
                    next: null
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
    console.log('Datos del curso actualizados:', courseData);
  }

  // Manejar cambios en la validez del formulario
  onFormValidChange(isValid: boolean): void {
    this.isFormValid = isValid;
    console.log('Estado de validez del formulario:', isValid);
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
      console.log('Guardando cambios del curso:', this.currentCourseData);
      
      // Simular una llamada asíncrona
      await this.updateCourse(this.courseId!, this.currentCourseData);
      
      // Actualizar datos iniciales después del guardado exitoso
      this.initialCourseData = JSON.parse(JSON.stringify(this.currentCourseData));
      this.hasChanges = false;
      
      // Mostrar mensaje de éxito
      alert('¡Curso actualizado exitosamente!');
      
      // Opcionalmente redirigir
      // this.router.navigate(['/courses']);
      
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      alert('Error al actualizar el curso. Por favor, inténtalo de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Simular actualización del curso (reemplaza con tu lógica real)
  private async updateCourse(courseId: string, courseData: CourseData): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito o error
        const success = Math.random() > 0.1; // 90% de probabilidad de éxito
        
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

    this.router.navigate(['/courses']); // Ajusta la ruta según tu aplicación
  }

  // Reintentar carga de datos
  onRetry(): void {
    this.loadCourseData();
  }

  // Método para obtener datos del curso (útil para debugging)
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