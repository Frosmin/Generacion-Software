import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { EditCourseComponent } from './edit-course.component';

// Mock del componente FormCourseComponent
@Component({
  selector: 'app-form-course',
  template: '<div>Mock Form Course Component</div>'
})
class MockFormCourseComponent {
  @Input() showPreview = false;
  @Input() initialData: any;
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

describe('EditCourseComponent', () => {
  let component: EditCourseComponent;
  let fixture: ComponentFixture<EditCourseComponent>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;
  let mockCourseData: CourseData;
  let modifiedCourseData: CourseData;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [EditCourseComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
    .overrideComponent(EditCourseComponent, {
      remove: {
        imports: [MockFormCourseComponent]
      },
      add: {
        imports: [MockFormCourseComponent]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCourseComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    // Datos de prueba originales
    mockCourseData = {
      course: {
        title: "Test Course",
        description: "Test Description",
        goto: "test-goto"
      },
      contents: [
        {
          title: "Test Content",
          paragraph: ["Test paragraph"],
          subcontent: [
            {
              subtitle: "Test Subtitle",
              subparagraph: ["Test subparagraph"],
              example: [{ code: "console.log('test');" }]
            }
          ],
          next: null,
          maxResourceConsumption: 100,
          maxProcessingTime: 5000
        }
      ]
    };

    // Datos modificados para pruebas
    modifiedCourseData = {
      course: {
        title: "Modified Test Course",
        description: "Modified Test Description",
        goto: "modified-test-goto"
      },
      contents: [
        {
          title: "Modified Test Content",
          paragraph: ["Modified Test paragraph"],
          subcontent: [
            {
              subtitle: "Modified Test Subtitle",
              subparagraph: ["Modified Test subparagraph"],
              example: [{ code: "console.log('modified test');" }]
            }
          ],
          next: null,
          maxResourceConsumption: 150,
          maxProcessingTime: 6000
        }
      ]
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(component.isSubmitting).toBeFalse();
      expect(component.isFormValid).toBeFalse();
      expect(component.showPreview).toBeFalse();
      expect(component.isLoading).toBeTrue();
      expect(component.hasError).toBeFalse();
      expect(component.errorMessage).toBe('');
      expect(component.hasChanges).toBeFalse();
      expect(component.courseId).toBeNull();
      expect(component.initialCourseData).toBeUndefined();
      expect(component.currentCourseData).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call loadCourseData on initialization', () => {
      spyOn(component, 'loadCourseData' as any);
      
      component.ngOnInit();
      
      expect(component['loadCourseData']).toHaveBeenCalled();
    });
  });

  describe('loadCourseData', () => {
    beforeEach(() => {
      spyOn(console, 'error');
    });

    it('should load course data successfully', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('123');
      spyOn(Math, 'random').and.returnValue(0.5);

      component['loadCourseData']();
      expect(component.isLoading).toBeTrue();
      expect(component.hasError).toBeFalse();

      tick(1500);

      expect(component.isLoading).toBeFalse();
      expect(component.hasError).toBeFalse();
      expect(component.courseId).toBe('123');
      expect(component.initialCourseData).toBeDefined();
      expect(component.currentCourseData).toBeDefined();
    }));

    it('should handle error when course ID is not found', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue(null);

      component['loadCourseData']();
      
      tick(0);

      expect(component.hasError).toBeTrue();
      expect(component.errorMessage).toBe('ID del curso no encontrado');
      expect(component.isLoading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));

    it('should handle error when fetching course data fails', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('123');
      spyOn(Math, 'random').and.returnValue(0.05);

      component['loadCourseData']();
      
      tick(1500);

      expect(component.hasError).toBeTrue();
      expect(component.errorMessage).toBe('No se pudo cargar el curso');
      expect(component.isLoading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('fetchCourseData', () => {
    it('should resolve with mock data on success', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.5);
      let result: CourseData | undefined;

      component['fetchCourseData']('123').then(data => {
        result = data;
      });

      tick(1500);

      expect(result).toBeDefined();
      expect(result?.course.title).toBe('afsafasfa');
    }));

    it('should reject on error', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.05);
      let errorThrown = false;

      component['fetchCourseData']('123').catch(() => {
        errorThrown = true;
      });

      tick(1500);

      expect(errorThrown).toBeTrue();
    }));
  });

  describe('Form Data Handling', () => {
    beforeEach(() => {
      component.initialCourseData = mockCourseData;
      component.currentCourseData = JSON.parse(JSON.stringify(mockCourseData));
    });

    it('should update course data and check for changes', () => {
      spyOn(component, 'checkForChanges' as any);

      component.onFormDataChange(modifiedCourseData);

      expect(component.currentCourseData).toEqual(modifiedCourseData);
      expect(component['checkForChanges']).toHaveBeenCalled();
    });

    it('should update form validity', () => {
      component.onFormValidChange(true);
      expect(component.isFormValid).toBeTrue();

      component.onFormValidChange(false);
      expect(component.isFormValid).toBeFalse();
    });
  });

  describe('checkForChanges', () => {
    it('should detect no changes when data is identical', () => {
      component.initialCourseData = mockCourseData;
      component.currentCourseData = JSON.parse(JSON.stringify(mockCourseData));

      component['checkForChanges']();

      expect(component.hasChanges).toBeFalse();
    });

    it('should detect changes when data is different', () => {
      component.initialCourseData = mockCourseData;
      component.currentCourseData = modifiedCourseData;

      component['checkForChanges']();

      expect(component.hasChanges).toBeTrue();
    });

    it('should set hasChanges to false when data is undefined', () => {
      component.initialCourseData = undefined;
      component.currentCourseData = undefined;

      component['checkForChanges']();

      expect(component.hasChanges).toBeFalse();
    });
  });

  describe('togglePreview', () => {
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
      component.courseId = '123';
      component.initialCourseData = mockCourseData;
      component.currentCourseData = modifiedCourseData;
      component.hasChanges = true;
    });

    it('should not submit if form is invalid', async () => {
      component.isFormValid = false;

      await component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Formulario inválido, sin datos o sin cambios');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should not submit if no current data', async () => {
      component.isFormValid = true;
      component.currentCourseData = undefined;

      await component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Formulario inválido, sin datos o sin cambios');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should not submit if no changes', async () => {
      component.isFormValid = true;
      component.hasChanges = false;

      await component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Formulario inválido, sin datos o sin cambios');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should submit successfully with valid data and changes', fakeAsync(() => {
      component.isFormValid = true;
      spyOn(Math, 'random').and.returnValue(0.5);

      component.onSubmit();
      expect(component.isSubmitting).toBeTrue();

      tick(2000);

      expect(window.alert).toHaveBeenCalledWith('¡Curso actualizado exitosamente!');
      expect(router.navigate).toHaveBeenCalledWith(['/cursos']);
      expect(component.isSubmitting).toBeFalse();
      expect(component.hasChanges).toBeFalse();
      expect(component.initialCourseData).toEqual(modifiedCourseData);
    }));

    it('should handle submission error', fakeAsync(() => {
      component.isFormValid = true;
      spyOn(Math, 'random').and.returnValue(0.05);

      component.onSubmit();
      expect(component.isSubmitting).toBeTrue();

      tick(2000);

      expect(console.error).toHaveBeenCalledWith('Error al actualizar el curso:', jasmine.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Error al actualizar el curso. Por favor, inténtalo de nuevo.');
      expect(component.isSubmitting).toBeFalse();
    }));
  });

  describe('updateCourse', () => {
    it('should resolve on success', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.5);
      let resolved = false;

      component['updateCourse']('123', mockCourseData).then(() => {
        resolved = true;
      });

      tick(2000);

      expect(resolved).toBeTrue();
    }));

    it('should reject on error', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.05);
      let rejected = false;

      component['updateCourse']('123', mockCourseData).catch(() => {
        rejected = true;
      });

      tick(2000);

      expect(rejected).toBeTrue();
    }));
  });

  describe('Cancellation', () => {
    beforeEach(() => {
      spyOn(window, 'confirm');
    });

    it('should navigate without confirmation when no changes', () => {
      component.hasChanges = false;

      component.onCancel();

      expect(window.confirm).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/cursos']);
    });

    it('should show confirmation dialog when there are changes', () => {
      component.hasChanges = true;
      (window.confirm as jasmine.Spy).and.returnValue(true);

      component.onCancel();

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados.');
      expect(router.navigate).toHaveBeenCalledWith(['/cursos']);
    });

    it('should not navigate when user cancels confirmation', () => {
      component.hasChanges = true;
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.onCancel();

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados.');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onRetry', () => {
    it('should call loadCourseData', () => {
      spyOn(component, 'loadCourseData' as any);

      component.onRetry();

      expect(component['loadCourseData']).toHaveBeenCalled();
    });
  });

  describe('Utility Methods and Getters', () => {
    it('should return current course data', () => {
      component.currentCourseData = mockCourseData;

      const result = component.getCourseData();

      expect(result).toEqual(mockCourseData);
    });

    it('should return undefined when no course data', () => {
      component.currentCourseData = undefined;

      const result = component.getCourseData();

      expect(result).toBeUndefined();
    });

    it('should return correct hasPendingChanges value', () => {
      component.hasChanges = true;
      expect(component.hasPendingChanges).toBeTrue();

      component.hasChanges = false;
      expect(component.hasPendingChanges).toBeFalse();
    });

    it('should return correct isLoadingData value', () => {
      component.isLoading = true;
      expect(component.isLoadingData).toBeTrue();

      component.isLoading = false;
      expect(component.isLoadingData).toBeFalse();
    });

    it('should return correct hasLoadingError value', () => {
      component.hasError = true;
      expect(component.hasLoadingError).toBeTrue();

      component.hasError = false;
      expect(component.hasLoadingError).toBeFalse();
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      // Simular que ya se cargaron los datos
      component.isLoading = false;
      component.hasError = false;
      component.initialCourseData = mockCourseData;
      component.currentCourseData = mockCourseData;
      fixture.detectChanges();
    });

    it('should render hero section with correct content', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('h1').textContent).toContain('Editar Curso');
      expect(compiled.querySelector('.welcome-message').textContent).toContain('Modifica y perfecciona tu curso de programación');
    });

    it('should render form course component with initial data', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('app-form-course')).toBeTruthy();
    });

    it('should render form actions buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.form-actions button');
      
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent.trim()).toBe('Cancelar');
      expect(buttons[1].textContent.trim()).toBe('Guardar Cambios');
    });

    it('should disable submit button when form is invalid', () => {
      component.isFormValid = false;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should disable submit button when no changes', () => {
      component.isFormValid = true;
      component.hasChanges = false;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid and has changes', () => {
      component.isFormValid = true;
      component.hasChanges = true;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeFalse();
    });

    it('should show loading state when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.textContent.trim()).toContain('⏳ Guardando...');
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
      component.hasChanges = true;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      submitButton.click();
      
      expect(component.onSubmit).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    beforeEach(() => {
      component.isLoading = false;
      component.hasError = false;
      component.initialCourseData = mockCourseData;
      fixture.detectChanges();
    });

    it('should handle form data change event', () => {
      spyOn(component, 'onFormDataChange');
      
      const formCourse = fixture.debugElement.query(sel => sel.name === 'app-form-course');
      formCourse.triggerEventHandler('formDataChange', modifiedCourseData);
      
      expect(component.onFormDataChange).toHaveBeenCalledWith(modifiedCourseData);
    });

    it('should handle form valid change event', () => {
      spyOn(component, 'onFormValidChange');
      
      const formCourse = fixture.debugElement.query(sel => sel.name === 'app-form-course');
      formCourse.triggerEventHandler('formValidChange', true);
      
      expect(component.onFormValidChange).toHaveBeenCalledWith(true);
    });

    it('should pass showPreview to form component', () => {
      component.showPreview = true;
      fixture.detectChanges();
      
      const formCourse = fixture.debugElement.query(sel => sel.name === 'app-form-course');
      expect(formCourse.attributes['ng-reflect-show-preview']).toBe('true');
    });

    it('should pass initialData to form component', () => {
      const formCourse = fixture.debugElement.query(sel => sel.name === 'app-form-course');
      expect(formCourse.componentInstance.initialData).toBe(mockCourseData);
    });
  });

  describe('Lifecycle and State Management', () => {
    it('should handle complete loading cycle', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('123');
      spyOn(Math, 'random').and.returnValue(0.5);

      component.ngOnInit();
      
      expect(component.isLoading).toBeTrue();
      expect(component.hasError).toBeFalse();
      
      tick(1500);
      
      expect(component.isLoading).toBeFalse();
      expect(component.hasError).toBeFalse();
      expect(component.courseId).toBe('123');
      expect(component.initialCourseData).toBeDefined();
      expect(component.currentCourseData).toBeDefined();
    }));

    it('should maintain state consistency after successful update', fakeAsync(() => {
      component.courseId = '123';
      component.isFormValid = true;
      component.hasChanges = true;
      component.initialCourseData = mockCourseData;
      component.currentCourseData = modifiedCourseData;
      
      spyOn(Math, 'random').and.returnValue(0.5);
      spyOn(window, 'alert');

      component.onSubmit();
      tick(2000);

      expect(component.hasChanges).toBeFalse();
      expect(component.initialCourseData).toEqual(modifiedCourseData);
      expect(component.isSubmitting).toBeFalse();
    }));
  });
});