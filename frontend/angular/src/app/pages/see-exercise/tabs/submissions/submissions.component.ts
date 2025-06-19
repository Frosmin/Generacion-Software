import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ExerciseSubmission {
  id: number;
  submittedAt: Date;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  executionTime: string;
  memory: string;
}

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SubmissionsComponent {
  @Input() submissions: ExerciseSubmission[] = [];
}
