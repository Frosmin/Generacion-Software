import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LearningProgressComponent } from './learning-progress.component';

describe('LearningProgressComponent', () => {
  let component: LearningProgressComponent;
  let fixture: ComponentFixture<LearningProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningProgressComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate overall progress correctly', () => {
    component.courses = [
      {
        id: 1,
        title: 'Test Course 1',
        progress: 60,
        modules: 10,
        completedModules: 6,
        image: 'test.png',
        lastAccessed: new Date(),
      },
      {
        id: 2,
        title: 'Test Course 2',
        progress: 40,
        modules: 8,
        completedModules: 3,
        image: 'test.png',
        lastAccessed: new Date(),
      },
    ];

    component.calculateOverallProgress();

    expect(component.totalProgress).toBe(50);
  });

  it('should count active and completed courses correctly', () => {
    component.courses = [
      {
        id: 1,
        title: 'Test Course 1',
        progress: 100,
        modules: 10,
        completedModules: 10,
        image: 'test.png',
        lastAccessed: new Date(),
      },
      {
        id: 2,
        title: 'Test Course 2',
        progress: 40,
        modules: 8,
        completedModules: 3,
        image: 'test.png',
        lastAccessed: new Date(),
      },
      {
        id: 3,
        title: 'Test Course 3',
        progress: 70,
        modules: 5,
        completedModules: 3,
        image: 'test.png',
        lastAccessed: new Date(),
      },
      {
        id: 4,
        title: 'Test Course 4',
        progress: 0,
        modules: 12,
        completedModules: 0,
        image: 'test.png',
        lastAccessed: new Date(),
      },
    ];

    component.countActiveCourses();

    expect(component.activeCourses).toBe(2);
    expect(component.completedCourses).toBe(1);
  });

  it('should format date correctly', () => {
    // Arrange
    const testDate = new Date(2025, 4, 15);

    const formattedDate = component.formatDate(testDate);

    expect(formattedDate).toBe('15/05/2025');
  });

  it('should initialize with test data on ngOnInit', () => {
    component.ngOnInit();

    expect(component.courses.length).toBeGreaterThan(0);
    expect(component.achievements.length).toBeGreaterThan(0);
    expect(component.username).toBe('Alex');
    expect(component.totalProgress).toBeGreaterThanOrEqual(0);
  });
});
