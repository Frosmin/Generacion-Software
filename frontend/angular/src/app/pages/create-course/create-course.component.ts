import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CoursesService } from '../../services/courses.service'; // Ajusta la ruta según tu estructura

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
  example: string[];
}

interface FormContentValue {
  title: string;
  paragraph: string;
  subcontent: FormSubcontentValue[];
}

interface FormSubcontentValue {
  subtitle: string;
  subparagraph: string;
  example: string[];
}

interface FormValue {
  title: string;
  description: string;
  contents: FormContentValue[];
}

@Component({
  selector: 'app-create-course',
  standalone: true,
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateCourseComponent implements OnInit {
  courseForm: FormGroup;
  isSubmitting = false;
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coursesService: CoursesService
  ) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit(): void {
    // Agregar el primer contenido por defecto
    if (this.contents.length === 0) {
      this.addContent();
    }
  }

  private createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      contents: this.fb.array([])
    });
  }

  // Getters para FormArrays
  get contents(): FormArray {
    return this.courseForm.get('contents') as FormArray;
  }

  getSubcontents(contentIndex: number): FormArray {
    return this.contents.at(contentIndex).get('subcontent') as FormArray;
  }

  getExamples(contentIndex: number, subcontentIndex: number): FormArray {
    return this.getSubcontents(contentIndex).at(subcontentIndex).get('example') as FormArray;
  }

  // Métodos para manejar contenidos
  addContent(): void {
    if (this.contents.length < 20) {
      const contentGroup = this.fb.group({
        title: ['', Validators.required],
        paragraph: ['', Validators.required],
        subcontent: this.fb.array([])
      });

      this.contents.push(contentGroup);
      
      // Agregar el primer subcontenido automáticamente
      this.addSubcontent(this.contents.length - 1);
      
      // Actualizar las referencias "next" automáticamente
      this.updateNextOptions();
    }
  }

  removeContent(index: number): void {
    if (this.contents.length > 1) {
      this.contents.removeAt(index);
      this.updateNextOptions();
    }
  }

  // Métodos para manejar subcontenidos
  addSubcontent(contentIndex: number): void {
    const subcontentGroup = this.fb.group({
      subtitle: ['', Validators.required],
      subparagraph: ['', Validators.required],
      example: this.fb.array([this.fb.control('', Validators.required)])
    });

    this.getSubcontents(contentIndex).push(subcontentGroup);
  }

  removeSubcontent(contentIndex: number, subcontentIndex: number): void {
    const subcontents = this.getSubcontents(contentIndex);
    if (subcontents.length > 1) {
      subcontents.removeAt(subcontentIndex);
    }
  }

  // Métodos para manejar ejemplos
  addExample(contentIndex: number, subcontentIndex: number): void {
    this.getExamples(contentIndex, subcontentIndex).push(
      this.fb.control('', Validators.required)
    );
  }

  removeExample(contentIndex: number, subcontentIndex: number, exampleIndex: number): void {
    const examples = this.getExamples(contentIndex, subcontentIndex);
    if (examples.length > 1) {
      examples.removeAt(exampleIndex);
    }
  }

  // Actualizar opciones de "siguiente contenido" automáticamente
  updateNextOptions(): void {
    // Esta función ahora solo actualiza los valores "next" internamente
    // No se muestra en el formulario, pero se usa en el JSON final
  }

  // Generar ruta de acceso automáticamente desde el título
  private generateGoto(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .trim();
  }

  // Formatear datos para el JSON final
  private formatCourseData(): CourseData {
    const formValue = this.courseForm.value as FormValue;
    
    const contents: ContentData[] = formValue.contents.map((content: FormContentValue, index: number) => {
      const contentData: ContentData = {
        title: content.title,
        paragraph: [content.paragraph],
        subcontent: content.subcontent.map((sub: FormSubcontentValue) => ({
          subtitle: sub.subtitle,
          subparagraph: [sub.subparagraph],
          example: sub.example.filter((ex: string) => ex.trim() !== '')
        })),
        next: null // Inicializar next como null por defecto
      };

      // Agregar "next" automáticamente si no es el último contenido
      if (index < formValue.contents.length - 1) {
        const nextContent = formValue.contents[index + 1];
        // Verificar que el siguiente contenido existe y tiene título
        if (nextContent && nextContent.title && nextContent.title.trim() !== '') {
          contentData.next = nextContent.title.trim();
        }
      }

      return contentData;
    });

    return {
      course: {
        title: formValue.title,
        description: formValue.description,
        goto: this.generateGoto(formValue.title)
      },
      contents
    };
  }

  // Vista previa del JSON
  getPreviewJson(): string {
    if (this.courseForm.valid) {
      return JSON.stringify(this.formatCourseData(), null, 2);
    }
    return 'Completa todos los campos requeridos para ver la vista previa';
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Validación personalizada
  private validateCourse(): boolean {
    // Validar que cada contenido tenga al menos un subcontenido
    for (let i = 0; i < this.contents.length; i++) {
      const subcontents = this.getSubcontents(i);
      if (subcontents.length === 0) {
        alert(`El contenido ${i + 1} debe tener al menos un subcontenido`);
        return false;
      }

      // Validar que cada subcontenido tenga al menos un ejemplo
      for (let j = 0; j < subcontents.length; j++) {
        const examples = this.getExamples(i, j);
        const validExamples = examples.controls.filter(ex => ex.value.trim() !== '');
        if (validExamples.length === 0) {
          alert(`El subcontenido ${j + 1} del contenido ${i + 1} debe tener al menos un ejemplo`);
          return false;
        }
      }
    }

    return true;
  }

  // MÉTODO ACTUALIZADO: Envío del formulario con integración a la API
  onSubmit(): void {
    if (this.courseForm.valid && this.validateCourse()) {
      this.isSubmitting = true;
      
      const courseData = this.formatCourseData();
      
      // Enviar el curso a la API
      this.coursesService.createCourse(courseData).subscribe({
        next: (response) => {
          console.log('Curso creado exitosamente:', response);
          
          // Mostrar mensaje de éxito
          alert(`¡Curso creado exitosamente! ID: ${response.id}`);
          
          // Opcional: Resetear el formulario o navegar a otra página
          this.courseForm.reset();
          this.contents.clear();
          this.addContent(); // Agregar contenido inicial
          
          // Opcional: Navegar a la lista de cursos o a ver el curso creado
          // this.router.navigate(['/courses']);
          
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error al crear el curso:', error);
          alert('Error al crear el curso: ' + error.message);
          this.isSubmitting = false;
        }
      });
      
    } else {
      this.markFormGroupTouched(this.courseForm);
      alert('Por favor, completa todos los campos requeridos');
    }
  }

  onCancel(): void {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
      this.courseForm.reset();
      this.contents.clear();
      this.addContent(); // Agregar contenido inicial
    }
  }

  // Marcar todos los campos como tocados para mostrar errores
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Método para actualizar ruta automáticamente cuando cambia el título
  onTitleChange(): void {
    // Este método se mantiene para compatibilidad con el template
    // La generación de goto ahora es automática en formatCourseData()
  }
}