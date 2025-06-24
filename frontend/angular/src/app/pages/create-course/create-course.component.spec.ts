import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CreateCourseComponent } from './create-course.component';

// Mock del componente FormCourseComponent
@Component({
  selector: 'app-form-course',
  template: '<div>Mock Form Course Component</div>'
})
class MockFormCourseComponent {
  @Input() showPreview = false;
  @Output() formDataChange = new EventEmitter<any>();
  @Output() formValidChange = new EventEmitter<boolean>();
}

// Interfaces para las pruebas
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

describe('CreateCourseComponent', () => {
  let component: CreateCourseComponent;
  let fixture: ComponentFixture<CreateCourseComponent>;
  let router: jasmine.SpyObj<Router>;
  let mockCourseData: CourseData;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateCourseComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .overrideComponent(CreateCourseComponent, {
      remove: {
        imports: [MockFormCourseComponent]
      },
      add: {
        imports: [MockFormCourseComponent]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCourseComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Datos de prueba
    mockCourseData = {
      course: {
        title: 'Test Course',
        description: 'Test Description',
        goto: 'test-goto'
      },
      contents: [
        {
          title: 'Test Content',
          paragraph: ['Test paragraph'],
          subcontent: [
            {
              subtitle: 'Test Subtitle',
              subparagraph: ['Test subparagraph'],
              example: [
                { code: 'console.log("test");' }
              ]
            }
          ],
          next: null,
          maxResourceConsumption: 100,
          maxProcessingTime: 5000
        }
      ]
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(component.isSubmitting).toBeFalse();
      expect(component.isFormValid).toBeFalse();
      expect(component.showPreview).toBeFalse();
      expect(component.currentCourseData).toBeNull();
    });
  });

  describe('Form Data Handling', () => {
    it('should update course data when form data changes', () => {
      component.onFormDataChange(mockCourseData);
      
      expect(component.currentCourseData).toEqual(mockCourseData);
    });

    it('should update form validity when form valid state changes', () => {
      component.onFormValidChange(true);
      
      expect(component.isFormValid).toBeTrue();
    });

    it('should handle form invalid state', () => {
      component.onFormValidChange(false);
      
      expect(component.isFormValid).toBeFalse();
    });
  });

  describe('Preview Functionality', () => {
    it('should toggle preview state', () => {
      expect(component.showPreview).toBeFalse();
      
      component.togglePreview();
      expect(component.showPreview).toBeTrue();
      
      component.togglePreview();
      expect(component.showPreview).toBeFalse();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
      spyOn(console, 'error');
    });

    it('should not submit if form is invalid', async () => {
      component.isFormValid = false;
      component.currentCourseData = mockCourseData;

      await component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Formulario inválido o sin datos');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should not submit if no course data', async () => {
      component.isFormValid = true;
      component.currentCourseData = null;

      await component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Formulario inválido o sin datos');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should submit successfully with valid data', fakeAsync(() => {
      component.isFormValid = true;
      component.currentCourseData = mockCourseData;
      
      // Mock Math.random para simular éxito
      spyOn(Math, 'random').and.returnValue(0.5);

      component.onSubmit();
      expect(component.isSubmitting).toBeTrue();

      tick(2000);

      expect(window.alert).toHaveBeenCalledWith('¡Curso creado exitosamente!');
      expect(router.navigate).toHaveBeenCalledWith(['/cursos']);
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle submission error', fakeAsync(() => {
      component.isFormValid = true;
      component.currentCourseData = mockCourseData;
      
      // Mock Math.random para simular error
      spyOn(Math, 'random').and.returnValue(0.05);

      component.onSubmit();
      expect(component.isSubmitting).toBeTrue();

      tick(2000);

      expect(console.error).toHaveBeenCalledWith('Error al crear el curso:', jasmine.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Error al crear el curso. Por favor, inténtalo de nuevo.');
      expect(component.isSubmitting).toBeFalse();
    }));
  });

  describe('Cancellation', () => {
    beforeEach(() => {
      spyOn(window, 'confirm');
    });

    it('should navigate to courses without confirmation when no changes', () => {
      component.currentCourseData = null;

      component.onCancel();

      expect(window.confirm).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/cursos']);
    });

    it('should show confirmation dialog when there are changes', () => {
      component.currentCourseData = mockCourseData;
      (window.confirm as jasmine.Spy).and.returnValue(true);

      component.onCancel();

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.');
      expect(router.navigate).toHaveBeenCalledWith(['/cursos']);
    });

    it('should not navigate when user cancels confirmation', () => {
      component.currentCourseData = mockCourseData;
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.onCancel();

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should return current course data', () => {
      component.currentCourseData = mockCourseData;

      const result = component.getCourseData();

      expect(result).toEqual(mockCourseData);
    });

    it('should return null when no course data', () => {
      component.currentCourseData = null;

      const result = component.getCourseData();

      expect(result).toBeNull();
    });
  });

  describe('Template Integration', () => {
    it('should render hero section with correct content', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('h1').textContent).toContain('Crear Nuevo Curso');
      expect(compiled.querySelector('.welcome-message').textContent).toContain('Diseña tu curso de programación paso a paso');
    });

    it('should render form course component', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('app-form-course')).toBeTruthy();
    });

    it('should render form actions buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.form-actions button');
      
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent.trim()).toBe('Cancelar');
      expect(buttons[1].textContent.trim()).toBe('Crear Curso');
    });

    it('should disable submit button when form is invalid', () => {
      component.isFormValid = false;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid', () => {
      component.isFormValid = true;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeFalse();
    });

    it('should show loading state when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.textContent.trim()).toContain('⏳ Creando...');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should call onCancel when cancel button is clicked', () => {
      spyOn(component, 'onCancel');
      
      const cancelButton = fixture.nativeElement.querySelector('.cancel-button');
      cancelButton.click();
      
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should call onSubmit when submit button is clicked', () => {
      spyOn(component, 'onSubmit');
      component.isFormValid = true;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      submitButton.click();
      
      expect(component.onSubmit).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('should handle form data change event', () => {
      spyOn(component, 'onFormDataChange');
      
      // Simular evento del componente hijo
      const formCourse = fixture.debugElement.query(sel => sel.name === 'app-form-course');
      formCourse.triggerEventHandler('formDataChange', mockCourseData);
      
      expect(component.onFormDataChange).toHaveBeenCalledWith(mockCourseData);
    });

    it('should handle form valid change event', () => {
      spyOn(component, 'onFormValidChange');
      
      // Simular evento del componente hijo
      const formCourse = fixture.debugElement.query(sel => sel.name === 'app-form-course');
      formCourse.triggerEventHandler('formValidChange', true);
      
      expect(component.onFormValidChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Private Methods', () => {
    it('should resolve saveCourse promise on success', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.5);
      let resolved = false;

      component['saveCourse'](mockCourseData).then(() => {
        resolved = true;
      });

      tick(2000);

      expect(resolved).toBeTrue();
    }));

    it('should reject saveCourse promise on error', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.05);
      let rejected = false;

      component['saveCourse'](mockCourseData).catch(() => {
        rejected = true;
      });

      tick(2000);

      expect(rejected).toBeTrue();
    }));
  });
});