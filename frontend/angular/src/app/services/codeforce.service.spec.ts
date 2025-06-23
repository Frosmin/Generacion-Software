import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CodeforcesService, TransformedProblem } from './codeforce.service';

describe('CodeforcesService', () => {
  let service: CodeforcesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CodeforcesService],
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

  it('should fetch and transform problems correctly', (done) => {
    const mockApiResponse = {
      status: 'OK',
      result: {
        problems: [
          {
            contestId: 123,
            index: 'A',
            name: 'Sample Problem',
            type: 'PROGRAMMING',
            rating: 800,
            tags: ['math'],
          },
        ],
        problemStatistics: [],
      },
    };

    service.getAllProblems().subscribe((problems) => {
      expect(problems.length).toBe(1);
      expect(problems[0].title).toBe('Sample Problem');
      expect(problems[0].difficulty).toBe('Medium');
      done();
    });

    const req = httpMock.expectOne(
      'https://codeforces.com/api/problemset.problems'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  it('should filter problems by difficulty', () => {
    const mockProblems: TransformedProblem[] = [
      {
        id: '1-A',
        title: 'Easy Prob',
        statement: '',
        tags: [],
        index: 'A',
        difficulty: 'Easy',
      },
      {
        id: '1-B',
        title: 'Hard Prob',
        statement: '',
        tags: [],
        index: 'B',
        difficulty: 'Hard',
      },
    ];

    const filtered = service.filterProblemsByDifficulty(mockProblems, 'easy');
    expect(filtered.length).toBe(1);
    expect(filtered[0].difficulty).toBe('Easy');
  });

  it('should return undefined if problem ID not found', (done) => {
    spyOn(service, 'getAllProblems').and.returnValue(
      new Observable<TransformedProblem[]>((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      })
    );

    service.getProblemById('non-existent-id').subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });
  });

  it('should map tags to readable topics', () => {
    const result = service['mapTagsToTopics'](['math', 'graphs', 'xyz']);
    expect(result).toContain('Matemáticas');
    expect(result).toContain('Teoría de Grafos');
    expect(result).toContain('Xyz'); // capitalized unknown tag
  });

  it('should generate examples for math problems', () => {
    const problem: TransformedProblem = {
      id: '123-A',
      title: 'Sum Problem',
      statement: '',
      tags: ['math'],
      rating: 800,
      index: 'A',
      difficulty: 'Easy',
      contestId: 123,
    };

    const examples = service['generateExamples'](problem);
    expect(examples.length).toBeGreaterThan(0);
    expect(examples[0].explanation).toContain('Suma simple');
  });
});
