import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  currentCourseData: CourseData | null = null;

  constructor(private router: Router) {}

  // Manejar cambios en los datos del formulario
  onFormDataChange(courseData: CourseData): void {
    this.currentCourseData = courseData;
    console.log('Datos del curso actualizados:', courseData);
  }

  // Manejar cambios en la validez del formulario
  onFormValidChange(isValid: boolean): void {
    this.isFormValid = isValid;
    console.log('Estado de validez del formulario:', isValid);
  }

  // Alternar vista previa del JSON
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Enviar formulario
  async onSubmit(): Promise<void> {
    if (!this.isFormValid || !this.currentCourseData) {
      console.error('Formulario inválido o sin datos');
      return;
    }

    this.isSubmitting = true;

    try {
      // Aquí puedes implementar tu lógica de envío
      // Por ejemplo, llamar a un servicio para guardar el curso
      console.log('Enviando curso:', this.currentCourseData);
      
      // Simular una llamada asíncrona
      await this.saveCourse(this.currentCourseData);
      
      // Mostrar mensaje de éxito y redirigir
      alert('¡Curso creado exitosamente!');
      this.router.navigate(['/cursos']); // Ajusta la ruta según tu aplicación
      
    } catch (error) {
      console.error('Error al crear el curso:', error);
      alert('Error al crear el curso. Por favor, inténtalo de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Simular guardado del curso (reemplaza con tu lógica real)
  private async saveCourse(courseData: CourseData): Promise<void> {
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

  // Cancelar creación
  onCancel(): void {
    const hasChanges = this.currentCourseData !== null;
    
    if (hasChanges) {
      const confirmLeave = confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.');
      if (!confirmLeave) {
        return;
      }
    }

    this.router.navigate(['/cursos']); // Ajusta la ruta según tu aplicación
  }

  // Método para obtener datos del curso (útil para debugging)
  getCourseData(): CourseData | null {
    return this.currentCourseData;
  }
}