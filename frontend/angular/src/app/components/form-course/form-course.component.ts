import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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

interface FormContentValue {
  title: string;
  paragraph: string;
  subcontent: FormSubcontentValue[];
  maxResourceConsumption: number;
  maxProcessingTime: number;
}

interface FormSubcontentValue {
  subtitle: string;
  subparagraph: string;
  example: FormExampleValue[];
}

interface FormExampleValue {
  code: string;
}

interface FormValue {
  title: string;
  description: string;
  contents: FormContentValue[];
}

// Custom validators
function positiveIntegerValidator(control: any) {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null; // Let required validator handle empty values
  }
  
  const numValue = Number(value);
  if (!Number.isInteger(numValue) || numValue <= 0) {
    return { positiveInteger: true };
  }
  
  return null;
}

@Component({
  selector: 'app-form-course',
  standalone: true,
  templateUrl: './form-course.component.html',
  styleUrls: ['./form-course.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormCourseComponent implements OnInit, OnChanges {
  @Input() initialData?: CourseData; // Para modo edición
  @Input() showPreview = false;
  @Output() formDataChange = new EventEmitter<CourseData>();
  @Output() formValidChange = new EventEmitter<boolean>();

  courseForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit(): void {
    // Agregar el primer contenido por defecto si no hay datos iniciales
    if (this.contents.length === 0 && !this.initialData) {
      this.addContent();
    }

    // Suscribirse a cambios del formulario
    this.courseForm.valueChanges.subscribe(() => {
      this.emitFormData();
    });

    this.courseForm.statusChanges.subscribe(() => {
      this.emitFormValid();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.loadInitialData(changes['initialData'].currentValue);
    }
  }

  private createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      contents: this.fb.array([])
    });
  }

  private createContentFormGroup(content?: ContentData): FormGroup {
    return this.fb.group({
      title: [content?.title || '', Validators.required],
      paragraph: [content?.paragraph?.join('\n') || '', Validators.required],
      maxResourceConsumption: [
        content?.maxResourceConsumption || '', 
        [Validators.required, positiveIntegerValidator]
      ],
      maxProcessingTime: [
        content?.maxProcessingTime || '', 
        [Validators.required, positiveIntegerValidator]
      ],
      subcontent: this.fb.array([])
    });
  }

  private createExampleFormGroup(example?: ExampleData): FormGroup {
    return this.fb.group({
      code: [example?.code || '', Validators.required]
    });
  }

  private loadInitialData(data: CourseData): void {
    // Limpiar contenidos existentes
    this.contents.clear();

    // Cargar datos del curso
    this.courseForm.patchValue({
      title: data.course.title,
      description: data.course.description
    });

    // Cargar contenidos
    data.contents.forEach(content => {
      const contentGroup = this.createContentFormGroup(content);

      // Cargar subcontenidos
      content.subcontent.forEach(subcontent => {
        const subcontentGroup = this.fb.group({
          subtitle: [subcontent.subtitle, Validators.required],
          subparagraph: [subcontent.subparagraph.join('\n'), Validators.required],
          example: this.fb.array(
            subcontent.example.map(example => this.createExampleFormGroup(example))
          )
        });

        (contentGroup.get('subcontent') as FormArray).push(subcontentGroup);
      });

      this.contents.push(contentGroup);
    });

    this.emitFormData();
    this.emitFormValid();
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
      const contentGroup = this.createContentFormGroup();
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
    const subcontents = this.getSubcontents(contentIndex);
    if (subcontents.length < 10) {
      const subcontentGroup = this.fb.group({
        subtitle: ['', Validators.required],
        subparagraph: ['', Validators.required],
        example: this.fb.array([this.createExampleFormGroup()])
      });

      subcontents.push(subcontentGroup);
    }
  }

  removeSubcontent(contentIndex: number, subcontentIndex: number): void {
    const subcontents = this.getSubcontents(contentIndex);
    if (subcontents.length > 1) {
      subcontents.removeAt(subcontentIndex);
    }
  }

  // Métodos para manejar ejemplos
  addExample(contentIndex: number, subcontentIndex: number): void {
    const examples = this.getExamples(contentIndex, subcontentIndex);
    if (examples.length < 5) {
      examples.push(this.createExampleFormGroup());
    }
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
          example: sub.example
            .filter((ex: FormExampleValue) => ex.code.trim() !== '')
            .map((ex: FormExampleValue) => ({
              code: ex.code
            }))
        })),
        next: null, // Inicializar next como null por defecto
        maxResourceConsumption: Number(content.maxResourceConsumption),
        maxProcessingTime: Number(content.maxProcessingTime)
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

  // Validación personalizada
  validateCourse(): boolean {
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
        const validExamples = examples.controls.filter(ex => 
          ex.get('code')?.value.trim() !== ''
        );
        if (validExamples.length === 0) {
          alert(`El subcontenido ${j + 1} del contenido ${i + 1} debe tener al menos un ejemplo válido`);
          return false;
        }
      }
    }

    return true;
  }

  // Marcar todos los campos como tocados para mostrar errores
  markFormGroupTouched(): void {
    this.markFormGroupTouchedRecursive(this.courseForm);
  }

  private markFormGroupTouchedRecursive(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouchedRecursive(control);
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

  // Métodos para emitir cambios al componente padre
  private emitFormData(): void {
    if (this.courseForm.valid) {
      this.formDataChange.emit(this.formatCourseData());
    }
  }

  private emitFormValid(): void {
    this.formValidChange.emit(this.courseForm.valid && this.validateCourse());
  }

  // Método para obtener los datos del formulario (para uso externo)
  getFormData(): CourseData | null {
    if (this.courseForm.valid && this.validateCourse()) {
      return this.formatCourseData();
    }
    return null;
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.courseForm.reset();
    this.contents.clear();
    this.addContent();
  }

  // Métodos auxiliares para obtener mensajes de error
  getResourceConsumptionError(contentIndex: number): string {
    const control = this.contents.at(contentIndex).get('maxResourceConsumption');
    if (control?.hasError('required')) {
      return 'El consumo máximo de recursos es requerido';
    }
    if (control?.hasError('positiveInteger')) {
      return 'Debe ser un número entero positivo mayor a 0';
    }
    return '';
  }

  getProcessingTimeError(contentIndex: number): string {
    const control = this.contents.at(contentIndex).get('maxProcessingTime');
    if (control?.hasError('required')) {
      return 'El tiempo máximo de procesamiento es requerido';
    }
    if (control?.hasError('positiveInteger')) {
      return 'Debe ser un número entero positivo mayor a 0';
    }
    return '';
  }
}