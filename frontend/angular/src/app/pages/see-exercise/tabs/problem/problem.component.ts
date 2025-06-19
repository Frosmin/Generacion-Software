import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ProblemComponent {
  @Input() exercise!: Exercise;

  copyText(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Texto copiado al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar texto: ', err);
      });
  }
}

