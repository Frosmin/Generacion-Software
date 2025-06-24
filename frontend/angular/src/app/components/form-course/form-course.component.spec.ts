import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { FormCourseComponent } from './form-course.component';

describe('FormCourseComponent', () => {
  let component: FormCourseComponent;
  let fixture: ComponentFixture<FormCourseComponent>;
  let formBuilder: FormBuilder;

  const mockCourseData = {
    course: {
      title: 'Test Course',
      description: 'Test Description',
      goto: 'test-course'
    },
    contents: [
      {
        title: 'Test Content 1',
        paragraph: ['Test paragraph content'],
        subcontent: [
          {
            subtitle: 'Test Subtitle',
            subparagraph: ['Test subparagraph content'],
            example: [
              {
                code: 'console.log("test");'
              }
            ]
          }
        ],
        next: null,
        maxResourceConsumption: 256,
        maxProcessingTime: 5000
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormCourseComponent,
        CommonModule,
        ReactiveFormsModule
      ],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(FormCourseComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.courseForm).toBeDefined();
      expect(component.contents.length).toBe(1); // Should have one content by default
    });

    it('should create form with required validators', () => {
      const titleControl = component.courseForm.get('title');
      const descriptionControl = component.courseForm.get('description');

      expect(titleControl?.hasError('required')).toBeTruthy();
      expect(descriptionControl?.hasError('required')).toBeTruthy();
    });

    it('should add first content automatically on init', () => {
      expect(component.contents.length).toBe(1);
      const firstContent = component.contents.at(0);
      expect(firstContent.get('title')).toBeDefined();
      expect(firstContent.get('paragraph')).toBeDefined();
      expect(firstContent.get('maxResourceConsumption')).toBeDefined();
      expect(firstContent.get('maxProcessingTime')).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should validate title with minimum length', () => {
      const titleControl = component.courseForm.get('title');
      titleControl?.setValue('ab');
      expect(titleControl?.hasError('minlength')).toBeTruthy();
      
      titleControl?.setValue('abc');
      expect(titleControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate description with minimum length', () => {
      const descriptionControl = component.courseForm.get('description');
      descriptionControl?.setValue('short');
      expect(descriptionControl?.hasError('minlength')).toBeTruthy();
      
      descriptionControl?.setValue('this is a longer description');
      expect(descriptionControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate positive integers for resource consumption', () => {
      const content = component.contents.at(0);
      const resourceControl = content.get('maxResourceConsumption');
      
      resourceControl?.setValue(-1);
      expect(resourceControl?.hasError('positiveInteger')).toBeTruthy();
      
      resourceControl?.setValue(0);
      expect(resourceControl?.hasError('positiveInteger')).toBeTruthy();
      
      resourceControl?.setValue(1.5);
      expect(resourceControl?.hasError('positiveInteger')).toBeTruthy();
      
      resourceControl?.setValue(256);
      expect(resourceControl?.hasError('positiveInteger')).toBeFalsy();
    });

    it('should validate positive integers for processing time', () => {
      const content = component.contents.at(0);
      const timeControl = content.get('maxProcessingTime');
      
      timeControl?.setValue(-1);
      expect(timeControl?.hasError('positiveInteger')).toBeTruthy();
      
      timeControl?.setValue(0);
      expect(timeControl?.hasError('positiveInteger')).toBeTruthy();
      
      timeControl?.setValue(1.5);
      expect(timeControl?.hasError('positiveInteger')).toBeTruthy();
      
      timeControl?.setValue(5000);
      expect(timeControl?.hasError('positiveInteger')).toBeFalsy();
    });
  });

  describe('Content Management', () => {
    it('should add content', () => {
      const initialLength = component.contents.length;
      component.addContent();
      expect(component.contents.length).toBe(initialLength + 1);
    });

    it('should not add more than 20 contents', () => {
      // Add contents up to the limit
      for (let i = component.contents.length; i < 20; i++) {
        component.addContent();
      }
      expect(component.contents.length).toBe(20);
      
      // Try to add one more
      component.addContent();
      expect(component.contents.length).toBe(20);
    });

    it('should remove content when more than one exists', () => {
      component.addContent();
      const initialLength = component.contents.length;
      component.removeContent(0);
      expect(component.contents.length).toBe(initialLength - 1);
    });

    it('should not remove content when only one exists', () => {
      component.removeContent(0);
      expect(component.contents.length).toBe(1);
    });
  });

  describe('Subcontent Management', () => {
    it('should add subcontent', () => {
      const initialLength = component.getSubcontents(0).length;
      component.addSubcontent(0);
      expect(component.getSubcontents(0).length).toBe(initialLength + 1);
    });

    it('should not add more than 10 subcontents', () => {
      // Add subcontents up to the limit
      for (let i = component.getSubcontents(0).length; i < 10; i++) {
        component.addSubcontent(0);
      }
      expect(component.getSubcontents(0).length).toBe(10);
      
      // Try to add one more
      component.addSubcontent(0);
      expect(component.getSubcontents(0).length).toBe(10);
    });

    it('should remove subcontent when more than one exists', () => {
      component.addSubcontent(0);
      const initialLength = component.getSubcontents(0).length;
      component.removeSubcontent(0, 0);
      expect(component.getSubcontents(0).length).toBe(initialLength - 1);
    });

    it('should not remove subcontent when only one exists', () => {
      component.removeSubcontent(0, 0);
      expect(component.getSubcontents(0).length).toBe(1);
    });
  });

  describe('Example Management', () => {
    it('should add example', () => {
      const initialLength = component.getExamples(0, 0).length;
      component.addExample(0, 0);
      expect(component.getExamples(0, 0).length).toBe(initialLength + 1);
    });

    it('should not add more than 5 examples', () => {
      // Add examples up to the limit
      for (let i = component.getExamples(0, 0).length; i < 5; i++) {
        component.addExample(0, 0);
      }
      expect(component.getExamples(0, 0).length).toBe(5);
      
      // Try to add one more
      component.addExample(0, 0);
      expect(component.getExamples(0, 0).length).toBe(5);
    });

    it('should remove example when more than one exists', () => {
      component.addExample(0, 0);
      const initialLength = component.getExamples(0, 0).length;
      component.removeExample(0, 0, 0);
      expect(component.getExamples(0, 0).length).toBe(initialLength - 1);
    });

    it('should not remove example when only one exists', () => {
      component.removeExample(0, 0, 0);
      expect(component.getExamples(0, 0).length).toBe(1);
    });
  });

  describe('Data Loading', () => {
    it('should load initial data correctly', () => {
      component.initialData = mockCourseData;
      component.ngOnChanges({
        initialData: {
          currentValue: mockCourseData,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      });

      expect(component.courseForm.get('title')?.value).toBe('Test Course');
      expect(component.courseForm.get('description')?.value).toBe('Test Description');
      expect(component.contents.length).toBe(1);
      
      const firstContent = component.contents.at(0);
      expect(firstContent.get('title')?.value).toBe('Test Content 1');
      expect(firstContent.get('maxResourceConsumption')?.value).toBe(256);
      expect(firstContent.get('maxProcessingTime')?.value).toBe(5000);
    });
  });

  describe('Data Formatting', () => {
    beforeEach(() => {
      // Set up a valid form
      component.courseForm.patchValue({
        title: 'Test Course',
        description: 'Test Description for the course'
      });
      
      const content = component.contents.at(0);
      content.patchValue({
        title: 'Test Content',
        paragraph: 'Test paragraph content',
        maxResourceConsumption: 256,
        maxProcessingTime: 5000
      });
      
      const subcontent = component.getSubcontents(0).at(0);
      subcontent.patchValue({
        subtitle: 'Test Subtitle',
        subparagraph: 'Test subparagraph content'
      });
      
      const example = component.getExamples(0, 0).at(0);
      example.patchValue({
        code: 'console.log("test");'
      });
    });

    it('should format course data correctly', () => {
      const formData = component.getFormData();
      
      expect(formData).toBeTruthy();
      expect(formData?.course.title).toBe('Test Course');
      expect(formData?.course.description).toBe('Test Description for the course');
      expect(formData?.course.goto).toBe('test-course');
      expect(formData?.contents.length).toBe(1);
      
      const content = formData?.contents[0];
      expect(content?.title).toBe('Test Content');
      expect(content?.maxResourceConsumption).toBe(256);
      expect(content?.maxProcessingTime).toBe(5000);
      expect(content?.paragraph).toEqual(['Test paragraph content']);
      expect(content?.subcontent.length).toBe(1);
      
      const subcontent = content?.subcontent[0];
      expect(subcontent?.subtitle).toBe('Test Subtitle');
      expect(subcontent?.subparagraph).toEqual(['Test subparagraph content']);
      expect(subcontent?.example.length).toBe(1);
      expect(subcontent?.example[0].code).toBe('console.log("test");');
    });

    it('should generate goto field correctly', () => {
      component.courseForm.patchValue({
        title: 'Test Course With Special Characters!'
      });
      
      const formData = component.getFormData();
      expect(formData?.course.goto).toBe('test-course-with-special-characters');
    });

    it('should set next field correctly', () => {
      // Add a second content
      component.addContent();
      const secondContent = component.contents.at(1);
      secondContent.patchValue({
        title: 'Second Content',
        paragraph: 'Second paragraph',
        maxResourceConsumption: 512,
        maxProcessingTime: 10000
      });
      
      // Add subcontent and example to second content
      const secondSubcontent = component.getSubcontents(1).at(0);
      secondSubcontent.patchValue({
        subtitle: 'Second Subtitle',
        subparagraph: 'Second subparagraph'
      });
      
      const secondExample = component.getExamples(1, 0).at(0);
      secondExample.patchValue({
        code: 'console.log("second");'
      });
      
      const formData = component.getFormData();
      expect(formData?.contents[0].next).toBe('Second Content');
      expect(formData?.contents[1].next).toBeNull();
    });
  });

  describe('Form Events', () => {
    it('should emit form data changes', () => {
      spyOn(component.formDataChange, 'emit');
      
      component.courseForm.patchValue({
        title: 'Test Course',
        description: 'Test Description for the course'
      });
      
      const content = component.contents.at(0);
      content.patchValue({
        title: 'Test Content',
        paragraph: 'Test paragraph',
        maxResourceConsumption: 256,
        maxProcessingTime: 5000
      });
      
      const subcontent = component.getSubcontents(0).at(0);
      subcontent.patchValue({
        subtitle: 'Test Subtitle',
        subparagraph: 'Test subparagraph'
      });
      
      const example = component.getExamples(0, 0).at(0);
      example.patchValue({
        code: 'console.log("test");'
      });
      
      // Trigger change detection
      fixture.detectChanges();
      
      expect(component.formDataChange.emit).toHaveBeenCalled();
    });

    it('should emit form validity changes', () => {
      spyOn(component.formValidChange, 'emit');
      
      component.courseForm.patchValue({
        title: 'Test Course'
      });
      
      // Trigger change detection
      fixture.detectChanges();
      
      expect(component.formValidChange.emit).toHaveBeenCalled();
    });
  });

  describe('Error Messages', () => {
    it('should return correct resource consumption error messages', () => {
      const content = component.contents.at(0);
      const resourceControl = content.get('maxResourceConsumption');
      
      resourceControl?.markAsTouched();
      resourceControl?.setValue('');
      expect(component.getResourceConsumptionError(0)).toBe('El consumo máximo de recursos es requerido');
      
      resourceControl?.setValue(-1);
      expect(component.getResourceConsumptionError(0)).toBe('Debe ser un número entero positivo mayor a 0');
      
      resourceControl?.setValue(256);
      expect(component.getResourceConsumptionError(0)).toBe('');
    });

    it('should return correct processing time error messages', () => {
      const content = component.contents.at(0);
      const timeControl = content.get('maxProcessingTime');
      
      timeControl?.markAsTouched();
      timeControl?.setValue('');
      expect(component.getProcessingTimeError(0)).toBe('El tiempo máximo de procesamiento es requerido');
      
      timeControl?.setValue(-1);
      expect(component.getProcessingTimeError(0)).toBe('Debe ser un número entero positivo mayor a 0');
      
      timeControl?.setValue(5000);
      expect(component.getProcessingTimeError(0)).toBe('');
    });
  });

  describe('Form Reset', () => {
    it('should reset form correctly', () => {
      // Fill form with data
      component.courseForm.patchValue({
        title: 'Test Course',
        description: 'Test Description'
      });
      
      component.addContent();
      
      // Reset form
      component.resetForm();
      
      expect(component.courseForm.get('title')?.value).toBeFalsy();
      expect(component.courseForm.get('description')?.value).toBeFalsy();
      expect(component.contents.length).toBe(1);
    });
  });

  describe('Custom Validation', () => {
    it('should validate that course has at least one content with subcontent and example', () => {
      // Create a valid form
      component.courseForm.patchValue({
        title: 'Test Course',
        description: 'Test Description for the course'
      });
      
      const content = component.contents.at(0);
      content.patchValue({
        title: 'Test Content',
        paragraph: 'Test paragraph',
        maxResourceConsumption: 256,
        maxProcessingTime: 5000
      });
      
      const subcontent = component.getSubcontents(0).at(0);
      subcontent.patchValue({
        subtitle: 'Test Subtitle',
        subparagraph: 'Test subparagraph'
      });
      
      const example = component.getExamples(0, 0).at(0);
      example.patchValue({
        code: 'console.log("test");'
      });
      
      expect(component.validateCourse()).toBeTruthy();
    });

    it('should return false when example code is empty', () => {
      // Create form with empty example
      component.courseForm.patchValue({
        title: 'Test Course',
        description: 'Test Description for the course'
      });
      
      const content = component.contents.at(0);
      content.patchValue({
        title: 'Test Content',
        paragraph: 'Test paragraph',
        maxResourceConsumption: 256,
        maxProcessingTime: 5000
      });
      
      const subcontent = component.getSubcontents(0).at(0);
      subcontent.patchValue({
        subtitle: 'Test Subtitle',
        subparagraph: 'Test subparagraph'
      });
      
      const example = component.getExamples(0, 0).at(0);
      example.patchValue({
        code: ''
      });
      
      spyOn(window, 'alert');
      expect(component.validateCourse()).toBeFalsy();
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should render course title input', () => {
      const titleInput = fixture.debugElement.query(By.css('#title'));
      expect(titleInput).toBeTruthy();
    });

    it('should render course description textarea', () => {
      const descriptionTextarea = fixture.debugElement.query(By.css('#description'));
      expect(descriptionTextarea).toBeTruthy();
    });

    it('should render add content button', () => {
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      expect(addButton).toBeTruthy();
    });

    it('should render content fields', () => {
      const contentTitle = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      const contentParagraph = fixture.debugElement.query(By.css('textarea[formControlName="paragraph"]'));
      const resourceConsumption = fixture.debugElement.query(By.css('input[formControlName="maxResourceConsumption"]'));
      const processingTime = fixture.debugElement.query(By.css('input[formControlName="maxProcessingTime"]'));
      
      expect(contentTitle).toBeTruthy();
      expect(contentParagraph).toBeTruthy();
      expect(resourceConsumption).toBeTruthy();
      expect(processingTime).toBeTruthy();
    });

    it('should disable add content button when limit reached', () => {
      // Add contents up to the limit
      for (let i = component.contents.length; i < 20; i++) {
        component.addContent();
      }
      
      fixture.detectChanges();
      
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      expect(addButton.nativeElement.disabled).toBeTruthy();
    });
  });
});