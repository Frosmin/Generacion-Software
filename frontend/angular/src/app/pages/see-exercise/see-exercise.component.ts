import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProblemComponent } from './tabs/problem/problem.component';
import { SubmitComponent } from './tabs/submit/submit.component';
import { SubmissionsComponent } from './tabs/submissions/submissions.component';

interface ExerciseSubmission {
  id: number;
  submittedAt: Date;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  executionTime: string;
  memory: string;
}

interface Exercise {
  id: string;
  title: string;
  difficulty: string;
  timeLimit: string;
  memoryLimit: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  topics: string[];
  materials: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
}

@Component({
  selector: 'app-see-exercise',
  templateUrl: './see-exercise.component.html',
  styleUrls: ['./see-exercise.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProblemComponent,
    SubmitComponent,
    SubmissionsComponent,
  ],
})
export class SeeExerciseComponent implements OnInit {
  activeTab: 'problem' | 'submit' | 'submissions' = 'problem';

  exercise: Exercise = {
    id: 'A123',
    title: 'Build an Array',
    difficulty: 'Easy',
    timeLimit: '1 second',
    memoryLimit: '512 megabytes',
    description:
      'Yesterday, Dima found an empty array and decided to add some integers to it. He can perform the following operation an unlimited number of times: add any integer to the left or right end of the array. then, as long as there is a pair of identical adjacent elements in the array, they will be replaced by their sum. It can be shown that there can be at most one such pair in the array at the same time. /n For example, if the array is [3,6,4] and we add the number 3 to the left, the array will first become [3,3,6,4], then the first two elements will be replaced by 6, and the array will become [6,6,4], and then — [12,4].',
    inputDescription: `The first line contains a single integer t (1≤t≤10^4) — the number of test cases. The descriptions of the test cases follow.
      The first line of each test case description contains two integers n and k (1≤n≤10^5, n≤k≤10^6) — the length of the resulting array and the number of operations.
      The second line contains n integers ai (1≤ai≤10^9, ai−1≠ai) — the elements of the resulting array.
      It is guaranteed that the sum of the values of n across all test cases does not exceed 10^5.`,
    outputDescription: `For each test case, if there is no suitable sequence of operations of length k, output "NO". Otherwise, output "YES".
      You may output "YES" and "NO" in any case (for example, the strings "yEs", "yes", "Yes", and "YES" will be recognized as a positive answer).`,
    topics: ['Matemáticas', 'Implementación'],
    materials: ['Aritmética Básica'],
    examples: [
      {
        input: '2 3',
        output: '5',
        explanation: '2 + 3 = 5',
      },
      {
        input: '100 200',
        output: '300',
        explanation: '100 + 200 = 300',
      },
    ],
  };

  submissions: ExerciseSubmission[] = [];

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.submissions = [
      {
        id: 1001,
        submittedAt: new Date(2025, 4, 15),
        status: 'Accepted',
        executionTime: '15ms',
        memory: '4KB',
      },
      {
        id: 1000,
        submittedAt: new Date(2025, 4, 15),
        status: 'Wrong Answer',
        executionTime: '12ms',
        memory: '4KB',
      },
    ];
  }

  goBack(): void {
    this.location.back();
  }

  setActiveTab(tab: 'problem' | 'submit' | 'submissions'): void {
    this.activeTab = tab;
  }

  onSolutionSubmitted(code: string): void {
    console.log('Solución enviada:', code);
  }

  handleKeydown(
    event: KeyboardEvent,
    tab: 'problem' | 'submit' | 'submissions'
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.setActiveTab(tab);
      event.preventDefault();
    }
  }
}
