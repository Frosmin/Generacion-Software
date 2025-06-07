import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CodeforcesService, CodeforcesApiResponse } from './codeforce.service';

describe('CodeforcesService', () => {
  let service: CodeforcesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CodeforcesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and map Codeforces problems correctly', () => {
    const mockResponse: CodeforcesApiResponse = {
      status: 'OK',
      result: {
        problems: [
          {
            contestId: 1234,
            index: 'A',
            name: 'Mock Problem A',
            type: 'PROGRAMMING',
            points: 500,
            rating: 1200,
            tags: ['math', 'greedy'],
          },
        ],
        problemStatistics: [],
      },
    };

    service.getAllProblems().subscribe((exercises) => {
      expect(exercises.length).toBe(1);
      expect(exercises[0].id).toBe('1234-A');
      expect(exercises[0].title).toBe('Mock Problem A');
      expect(exercises[0].rating).toBe(1200);
    });

    const req = httpMock.expectOne(
      'https://codeforces.com/api/problemset.problems'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should filter problems by difficulty', () => {
    const mockExercises = [
      { id: '1', rating: 800, tags: [], title: '', statement: '', index: 'A' },
      { id: '2', rating: 1300, tags: [], title: '', statement: '', index: 'B' },
      { id: '3', rating: 1900, tags: [], title: '', statement: '', index: 'C' },
      { id: '4', tags: [], title: '', statement: '', index: 'D' }, // sin rating
    ];

    const easy = service.filterProblemsByDifficulty(
      mockExercises as any,
      'easy'
    );
    const medium = service.filterProblemsByDifficulty(
      mockExercises as any,
      'medium'
    );
    const hard = service.filterProblemsByDifficulty(
      mockExercises as any,
      'hard'
    );

    expect(easy.length).toBe(0);
    expect(medium.length).toBe(1);
    expect(hard.length).toBe(2);
  });
});
